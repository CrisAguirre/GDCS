import { Component, ViewChild, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { MatDialog, MatTabNav, MatTabLink, DateAdapter } from '@angular/material';
import { DialogHabeasComponent } from '@app/compartido/componentes/dialog-habeas/dialog-habeas.component';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { AuthenticationService } from '@app/core/servicios/authentication.service';
import { Constants } from '@app/compartido/helpers/constants';
import { ApproveData } from '@app/compartido/modelos/approve-data';
import { Router } from '@angular/router';
import { TabsModel } from '@app/compartido/modelos/tabs-model';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService } from '@app/core/servicios/alert.service';

@Component({
  selector: 'app-hoja-vida',
  templateUrl: './hoja-vida.component.html',
  styleUrls: ['./hoja-vida.component.scss']
})
export class HojaVidaComponent implements OnInit, OnDestroy, AfterViewChecked {


  private user = this.commonService.getVar(configMsg.USER);
  public showProgressLoading: boolean = true;

  @ViewChild("mtg", { static: false }) tg: MatTabNav;
  @ViewChild("mtl", { static: false }) tgl: MatTabLink;
  private valueProgress = 0;
  public progress = {
    valueFake: this.valueProgress,
    value: this.valueProgress,
    title: `${this.valueProgress}%`
  }
  public progresClass = 'progressBarColor0';
  public lang: string = '';

  public navLinks: TabsModel[] = [];
  constructor(
    private emitter: EmitterService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private auth: AuthenticationService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private dateAdapter: DateAdapter<any>) {

    this.lang = this.ct.getLangDefault().langBd;
    this.dateAdapter.setLocale(this.ct.getLangDefault().lang);
    this.listenEmitterProgressBar();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.loadConfigTabs();
    this.verifyHabeasData();
  }

  ngOnDestroy(): void {
    //this.emitter.emitterSubscribeCV.unsubscribe();
    this.emitter.unsubscribeEmitterCV();
  }

  public async loadConfigTabs() {
    const tabs = (<any>await this.commonService.getConfigTabsCV().toPromise()).datos;
    tabs.forEach(e => {
      const tab: TabsModel = JSON.parse(e.valor);
      tab.disabled = tab.order > 1,
        tab.colorDisabled = 'rgb(143, 154, 156)',
        this.navLinks.push(tab);
    });
    this.navLinks = this.navLinks.sort((a, b) => a.order - b.order);
    //Filtrar tabs a las que tiene permiso el usuario
    this.navLinks = this.navLinks.filter(n => this.commonService.hasPermissionUser(n.path) != null);
  }

  private listenEmitterProgressBar() {
    this.emitter.emitterSubscribeCV.subscribe(
      message => {
        if (message.progressBar) {
          this.getDetailPorcentage();
        }
        if (message.showProgressLoading != undefined) {
          this.showProgressLoading = message.showProgressLoading;
        }
      });
  }

  private getDetailPorcentage() {
    this.commonService.getDetailPorcentageUser(this.user.id).subscribe(
      (r: any) => {
        this.valueProgress = r.porcentajeAvance
        this.progress = {
          valueFake: this.valueProgress == 0 ? 0 : this.valueProgress,
          value: this.valueProgress == 0 ? 100 : this.valueProgress,
          // title: `${this.ct.PROGRESS_CURRICULUM_VITAE} ${this.valueProgress}%`,
          title: `${this.valueProgress}%`,
        };
        if (this.valueProgress > 0) {
          this.navLinks.forEach((e, i) => {
            if (i > 0) {
              e.disabled = false;
            }
          });
        }
      }, e => {
        console.log('Error', e);
      }
    );
  }

  public verifyHabeasData(): void {
    this.getAproveeDataByUser()
      .then(
        (res: any) => {
          if (res.datos.length == 0) {
            const aproveeData = new ApproveData();
            aproveeData.idUsuarioModificacion = this.auth.getUser().id;
            aproveeData.aceptaHabeasData = Constants.NOT_ACCEPT;
            aproveeData.enviaNotificacionEmail = Constants.NOT_ACCEPT;
            this.commonService.createAproveeData(aproveeData)
              .subscribe(
                () => {
                  this.openDialogHabeas();
                }, err => {
                  console.log('Error', err);
                }
              );
          } else {
            if (res.datos[0].aceptaHabeasData == Constants.NOT_ACCEPT) {
              this.openDialogHabeas();
            } else {
              this.loadListenersConfig();
            }
          }
        });
  }

  public openDialogHabeas() {
    const msgHabeas = this.commonService.getVar(configMsg.HABEAS_DATA_MESSAGE);
    const dialogRef = this.dialog.open(DialogHabeasComponent, {
      disableClose: true,
      maxWidth: '90%',
      maxHeight: '90%',
      data: { text: msgHabeas },
      panelClass: 'col-md-6',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAproveeDataByUser()
          .then(
            (res: any) => {
              if (res.datos.length > 0) {
                const aproveeData = <ApproveData>res.datos[0];
                aproveeData.aceptaHabeasData = Constants.ACCEPT;
                this.commonService.updateAproveeData(aproveeData).toPromise()
                  .then(() => this.loadListenersConfig())
                  .catch(err => console.log('Error', err));
              }
            });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  public async getAproveeDataByUser() {
    return await this.commonService.getAproveeDataByUser(this.auth.getUser().id).toPromise();
  }

  tabChanged(tabChangeEvent, link: TabsModel) {
    if (!this.showProgressLoading && !link.disabled) {
      this.router.navigate(['/cv/' + link.path]);
    }
  }

  public loadListenersConfig() {
    this.getDetailPorcentage();
  }
}