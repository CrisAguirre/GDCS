import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FormControl } from '@angular/forms';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { TodoItemFlatNode, Vista } from '@app/compartido/modelos/vista';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource, MatCheckboxChange, MatDialog } from '@angular/material';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { Empresa } from '@app/compartido/modelos/empresa';
import { RolModel } from '@app/compartido/modelos/rol-model';
import { configMsg } from '@app/compartido/helpers/enums';
import { Constants } from '@app/compartido/helpers/constants';
import { DialogRolVistaComponent } from '@app/compartido/componentes/dialog-rol-vista/dialog-rol-vista.component';


@Component({
  selector: 'app-roles-vista',
  templateUrl: './roles-vista.component.html',
  styleUrls: ['./roles-vista.component.scss']
})
export class RolesVistaComponent extends BaseController implements OnInit, AfterViewChecked {


  dataChange = new BehaviorSubject<Vista[]>([]);

  get data(): Vista[] { return this.dataChange.value; }
  private lstVistasAll: Vista[] = [];
  public lstVistas: Vista[] = [];
  //public lstVistasClone: Vista[] = [];
  public lstVistasSelected: Vista[] = [];
  //public lstSelected: TodoItemFlatNode[] = [];
  public submit = false;
  public lstRolVista: RolVista[] = [];
  public lstAllRolUsuario: RolModel[] = [];
  public lstRolUsuario: RolModel[] = [];
  private lstRolUsuarioAll: RolModel[] = [];
  public lstEmpresas: Empresa[] = [];
  private user = this.commonService.getVar(configMsg.USER);

  public idRolUsuario: FormControl = new FormControl();
  public idEmpresa: FormControl = new FormControl();

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, Vista>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<Vista, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  //selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  //newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<Vista, TodoItemFlatNode>;

  dataSourceTree: MatTreeFlatDataSource<Vista, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: Vista): Vista[] => node.hijosVista;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  filterVistas = (lstRoles: RolVista[], lstVistas: Vista[]) => {
    const res: Vista[] = [];
    lstRoles.forEach(x => {
      const obj = this.findVista(x.idVista, lstVistas);
      if (obj) {
        res.push(obj);
      }
    });
    return res;
  }

  findVista = (id: string, lstVistas: Vista[]) => {
    const find: Vista = lstVistas.find(x => {
      if (x.id === id) {
        return x;
      } else if (x.hijosVista && x.hijosVista.length > 0) {
        const finded = this.findVista(id, x.hijosVista);
        if (finded) {
          return finded;
        }
      }
    });
    return find;
  }

  plainLstVistas = (lstVistas: Vista[]) => {
    let result: Vista[] = [];
    lstVistas.forEach(x => {
      if (x.hijosVista && x.hijosVista.length > 0) {
        result.push(...this.plainLstVistas(x.hijosVista));
      } else {
        result.push(x);
      }
    });
    return result;
  }

  findVistaByRol = (lstRoles: RolVista[], lstVistas: Vista[]) => {
    const res: Vista[] = [];
    lstRoles.forEach(x => {
      const finded = lstVistas.find(z => x.idVista === z.id);
      if (finded) {
        res.push(finded);
      }
    });
    return res;
  }


  buildPermisionsString = (rolVista: RolVista) => {
    const persmissions: string[] = [];
    if (rolVista.permiteCrear === 1) {
      persmissions.push('C');
    }
    if (rolVista.permiteActualizar === 1) {
      persmissions.push('A');
    }
    if (rolVista.permiteLectura === 1) {
      persmissions.push('L');
    }
    if (rolVista.permiteEliminar === 1) {
      persmissions.push('E');
    }
    if (rolVista.persmisosEspeciales) {
      persmissions.push(rolVista.persmisosEspeciales);
    }
    return persmissions.join(' / ');
  }

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
    private ct: CustomTranslateService,
    public dialog: MatDialog) {
    super();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadData();
    this.dataChange.subscribe(data => {
      this.dataSourceTree.data = data;
    });
  }


  private async loadData() {
    this.lstVistasAll = (await this.commonService.getVistas().toPromise() as any).datos;

    this.lstVistasAll.forEach(x => {
      if (x.idReferencia) {
        x.referenciaPadre = this.lstVistasAll.find(z => z.id === x.idReferencia);
      }
    });

    this.lstVistasAll.forEach(x => {
      x.pathComplete = Constants.getPathComplete(x);
    });

    //this.lstAllRolUsuario = (await this.commonService.getRolUsuario().toPromise() as any).datos;
    this.lstEmpresas = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;

    if (this.user.idRol === 1) {
      //this.lstRolVista = (await this.commonService.getVistasRolUsuario().toPromise() as any).datos;
      this.lstRolUsuarioAll = (await this.commonService.getRolUsuario().toPromise() as any).datos;
      this.lstRolUsuario.push(...this.lstRolUsuarioAll.filter(x => !x.idEmpresa || x.idEmpresa === null || x.idEmpresa === '')
        .map(z => {
          z.rol = '★ ' + z.rol;
          return z;
        }));
    } else {

      this.lstRolUsuario = (await this.commonService.getRolesPorEmpresa(this.user.idEmpresa).toPromise() as any).datos;
      this.cargarRolesPorEmpresa({ value: this.user.idEmpresa });
      this.cargarRolesVistaPorRol({ value: this.user.idRol });
      // this.lstRolVista = (await this.commonService.getVistasRolByRolUsuario(this.user.idRol).toPromise() as any).datos;
      //this.lstVistasSelected = this.filterVistas(this.lstRolVista, this.lstVistas);
    }

    // this.dataChange.next(this.lstVistas);

  }

  public async cargarRolesPorEmpresa(event) {
    this.checklistSelection.clear();
    this.lstRolUsuario = (await this.commonService.getRolesPorEmpresa(event.value).toPromise() as any).datos;
    if (this.user.idRol === 1) {
      this.lstRolUsuario.push(...this.lstRolUsuarioAll.filter(x => !x.idEmpresa || x.idEmpresa === null || x.idEmpresa === ''));
    }
    this.idRolUsuario.setValue('');
    this.checklistSelection.clear();
    this.lstVistas = [];
    this.lstVistasSelected = [];
    this.dataChange.next([]);
    this.nestedNodeMap.clear();
    this.flatNodeMap.clear();
  }

  public async cargarRolesVistaPorRol(event) {
    this.alertService.loading();

    this.checklistSelection.clear();
    this.lstVistas = [];
    this.lstVistasSelected = [];
    this.dataChange.next([]);
    this.nestedNodeMap.clear();
    this.flatNodeMap.clear();

    this.lstVistas = [];
    const idRol = event.value;
    if (idRol) {

      this.lstVistasAll.forEach(val => this.lstVistas.push(Object.assign({}, val)));

      this.lstRolVista = (await this.commonService.getVistasRolByRolUsuario(idRol).toPromise() as any).datos;
      //this.lstRolVista = (await this.commonService.getVistasRolByRolUsuario(1).toPromise() as any).datos;

      this.lstVistas.forEach(x => {
        const find = this.lstRolVista.find(z => z.idVista === x.id);
        if (find) {
          x.rolVista = find;
          this.lstVistasSelected.push(x);
        } else {
          x.rolVista = this.createRolVistaBase(x.id, idRol);
        }
      });

      this.lstVistas = this.commonService.buildTreeVistas(this.lstVistas);

      this.dataChange.next(this.lstVistas);
    }

    this.alertService.close();

  }



  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: Vista, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.nombreVista
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.nombreVista;
    flatNode.level = level;
    // flatNode.path = node.pathComplete;
    if (node.rolVista && node.rolVista.id) {
      const persmissions: string[] = [];
      if (node.rolVista.permiteCrear === 1) {
        persmissions.push('C');
      }
      if (node.rolVista.permiteActualizar === 1) {
        persmissions.push('A');
      }
      if (node.rolVista.permiteLectura === 1) {
        persmissions.push('L');
      }
      if (node.rolVista.permiteEliminar === 1) {
        persmissions.push('E');
      }
      if (node.rolVista.persmisosEspeciales) {
        persmissions.push(node.rolVista.persmisosEspeciales);
      }

      flatNode.info = this.buildPermisionsString(node.rolVista);

      flatNode.path = node.nombreRuta;
    }

    flatNode.expandable = node.hijosVista && node.hijosVista.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    const v = this.lstVistasSelected.find(x => x.id === node.id);
    if (v) {
      this.checklistSelection.select(...[flatNode]);
    }

    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(event: MatCheckboxChange, node: TodoItemFlatNode) {
    if (!event.checked) {
      this.alertService.comfirmation(this.ct.UNSELECTED_CONFIRMATION, TYPES.WARNING)
        .then(val => {
          if (val.dismiss) {
            this.checklistSelection.toggle(node);
            this.checklistSelection.toggle(node);
            event.source.checked = true;
            return;
          } else {
            node.info = '';
            this.checklistSelection.toggle(node);
            const descendants = this.treeControl.getDescendants(node);
            if (this.checklistSelection.isSelected(node)) {
              this.checklistSelection.select(...descendants);
              descendants.forEach(child => {
                const vista = this.flatNodeMap.get(child);
                child.info = this.buildPermisionsString(vista.rolVista);
              });
            } else {
              this.checklistSelection.deselect(...descendants);
              descendants.forEach(child => {
                child.info = '';
              });
            }

            // Force update for the parent
            descendants.forEach(child => this.checklistSelection.isSelected(child));
            this.checkAllParentsSelection(node);
          }
        });
    } else {
      this.checklistSelection.toggle(node);
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);


      if (this.checklistSelection.isSelected(node)) {
        this.checklistSelection.select(...descendants);
        descendants.forEach(child => {
          const vista = this.flatNodeMap.get(child);
          child.info = this.buildPermisionsString(vista.rolVista);
        });
        const vistaN = this.flatNodeMap.get(node);
        node.info = this.buildPermisionsString(vistaN.rolVista);
      } else {
        this.checklistSelection.deselect(...descendants);
        descendants.forEach(child => {
          child.info = '';
        });
        node.info = '';
      }

      // Force update for the parent
      descendants.forEach(child => this.checklistSelection.isSelected(child));
      this.checkAllParentsSelection(node);
    }


  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(event: MatCheckboxChange, node: TodoItemFlatNode): void {

    if (this.checklistSelection.isSelected(node)) {
      node.info = '';
    } else {
      const vista = this.flatNodeMap.get(node);
      //abrir dialogo para marcar permisos de acciones
      const dialogRef = this.dialog.open(DialogRolVistaComponent, {
        data: vista,
        disableClose: true,
        maxWidth: '90%',
        maxHeight: '90%',
        panelClass: 'col-sm-6',
      });

      //escuchar el cierre del dialogo
      dialogRef.afterClosed().subscribe((res: Vista) => {
        if (res) {
          vista.rolVista = res.rolVista;
          node.info = this.buildPermisionsString(vista.rolVista);
          this.flatNodeMap.set(node, vista);
        } else {
          this.checklistSelection.toggle(node);
          event.source.checked = false;
        }
      });
    }

    this.checklistSelection.toggle(node);

    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  // addNewItem(node: TodoItemFlatNode) {
  //   const parentNode = this.flatNodeMap.get(node);
  //   //this._database.insertItem(parentNode!, '');
  //   const newVista: Vista = {
  //     id: 'asd',
  //     idReferencia: null,
  //     nombreVista: 'nueva',
  //     nombreRuta: 'ruta',
  //     hijosVista: null
  //   }
  //   if (parentNode.hijosVista) {
  //     parentNode.hijosVista.push(newVista);
  //     this.dataChange.next(this.data);
  //   }
  //   this.treeControl.expand(node);
  // }

  editElement(node: TodoItemFlatNode) {
    const vista = this.flatNodeMap.get(node);
    const dialogRef = this.dialog.open(DialogRolVistaComponent, {
      data: vista,
      disableClose: true,
      maxWidth: '90%',
      maxHeight: '90%',
      panelClass: 'col-sm-6',
    });

    dialogRef.afterClosed().subscribe((res: Vista) => {
      if (res) {
        vista.rolVista = res.rolVista;
        node.info = this.buildPermisionsString(vista.rolVista);
        this.flatNodeMap.set(node, vista);
      }
    });
  }

  /** Save the node to database */
  // saveNode(node: TodoItemFlatNode, itemValue: string) {
  //   const nestedNode = this.flatNodeMap.get(node);
  //   //this._database.updateItem(nestedNode!, itemValue);
  // }


  public save() {

    this.alertService.comfirmation(this.ct.UPDATE_CONFIRMATION_RECORDS, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.submit = true;
          this.alertService.loading();

          const lst = this.getRolVistaToSave(this.dataSourceTree.data);

          const lstRolVistaDelete = this.lstRolVista.filter(x => {
            if (!lst.find(z => z.id === x.id)) {
              return x;
            }
          });

          const lstRolVistaUpdate = lst.filter(x => {
            if (!x.id) {
              return true;
            } else {
              const update = this.lstRolVista.find(z => z.id === x.id);
              if (x.permiteActualizar !== update.permiteActualizar
                || x.permiteCrear !== update.permiteCrear
                || x.permiteEliminar !== update.permiteEliminar
                || x.permiteLectura !== update.permiteLectura
                || x.persmisosEspeciales !== update.persmisosEspeciales) {
                return true;
              }
            }
            return false;
          });

          lstRolVistaDelete.forEach(async x => {
            await this.commonService.deleteVistaRolUsuario(x)
              .toPromise()
              .catch((err) => {
                this.submit = false;
                this.alertService.showError(err);
              });
          });

          lstRolVistaUpdate.forEach(async x => {
            await this.commonService.saveVistaRolUsuario(x)
              .toPromise()
              .catch((err) => {
                this.submit = false;
                this.alertService.showError(err);
              });
          });

          this.clean();

          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);

        }
      });
  }

  getRolVistaToSave = (lstVista: Vista[]): RolVista[] => {
    const lstRolVista: RolVista[] = [];
    lstVista.forEach(x => {
      const flatNode = this.nestedNodeMap.get(x);
      const rolVista1 = x.rolVista;
      if (this.checklistSelection.isSelected(flatNode)) {
        //const rolVista1 = x.rolVista;
        // const vista1 = this.flatNodeMap.get(flatNode);
        // const rolVista2 = vista1.rolVista;
        lstRolVista.push(rolVista1);
      }
      if (x.hijosVista && x.hijosVista.length > 0) {
        const lstChild = this.getRolVistaToSave(x.hijosVista);
        if (lstChild && lstChild.length > 0) {
          lstRolVista.push(rolVista1);
          lstRolVista.push(...lstChild);
        }
      }
    });
    return lstRolVista;
  }

  public clean() {
    this.idEmpresa.setValue('');
    this.idRolUsuario.setValue('');
    this.checklistSelection.clear();
    this.lstVistas = [];
    this.lstVistasSelected = [];
    this.dataChange.next([]);
    this.nestedNodeMap.clear();
    this.flatNodeMap.clear();
  }


  private createRolVistaBase(idVistaP = null, idRolP = null): RolVista {
    const rolVista: RolVista = {
      id: null,
      permiteCrear: 1,
      permiteLectura: 1,
      permiteActualizar: 1,
      permiteEliminar: 1,
      persmisosEspeciales: null,
      idVista: idVistaP,
      idRol: idRolP
    };

    return rolVista;
  }

}
