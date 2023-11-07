import { element } from 'protractor';
import { Component, OnInit, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import * as navs from '../navs/navs-principal';
import { configMsg } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { CuentaService } from '../servicios/cuenta.service';
import { CurriculumVitaeService } from './../servicios/cv.service';
import { NotificacionModel } from '@app/compartido/modelos/notificacion-model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { ConvocatoriaService } from '../servicios/convocatoria.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Constants as C } from '@app/compartido/helpers/constants';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent extends BaseController implements OnInit {
    private listTitles: any[];
    location: Location;
    mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;
    public notificationCounter = 0;
    public lstNotificationsByUser: NotificacionModel[] = [];
    public lstConvocatoriesAll: Convocatoria[] = [];
    public form: FormGroup;
    private dialogRefInfo: MatDialogRef<any, any>;

    public nameUser: any;
    public company: any;
    public dataMsg: any;
    public elementCurrent: any = {};

    public user = this.commonService.getVar(configMsg.USER);

    @ViewChild('formV', { static: false }) formV: NgForm;
    @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private commonService: CommonService,
        private cs: ConvocatoriaService,
        private cuentaService: CuentaService,
        private cvService: CurriculumVitaeService,
        private fb: FormBuilder,
        private dialogService: MatDialog,
        private sanitizer: DomSanitizer
    ) {
        super();
        this.location = location;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        this.loadForm();
        this.loadData();
        this.loadUserData();
        return;
        this.listTitles = navs.ROUTES.filter(listTitle => listTitle);
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
        this.router.events.subscribe((event) => {
            this.sidebarClose();
            var $layer: any = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
                this.mobile_menu_visible = 0;
            }
        });
    }

    public async loadData() {
        this.notificationCounter = 0;
        this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
        this.lstNotificationsByUser = (await this.commonService.getTodosNotificacionesByUsuario(this.user.id).toPromise() as any).datos;
        this.lstNotificationsByUser = this.lstNotificationsByUser.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
        if (this.lstNotificationsByUser.length > 0) {
            this.lstNotificationsByUser.forEach(e => {
                if (e.esLeido === 0) {
                    this.notificationCounter++;
                }

                if (e.idConvocatoria) {
                    if (this.lstConvocatoriesAll.length > 0) {
                        const convocatoria: Convocatoria = this.lstConvocatoriesAll.find(a => a.id === e.idConvocatoria);
                        e.nombreConvocatoria = convocatoria.nombreConvocatoria;
                    }
                }
            });
        }
    }

    public loadForm() {
        this.form = this.fb.group(
            {
                idEmpresa: new FormControl({ value: '', disabled: true }),
                idConvocatoria: new FormControl({ value: '', disabled: true }),
                asunto: new FormControl({ value: '', disabled: true }),
                mensaje: new FormControl({ value: '', disabled: true }),
            }
        );
    }

    get f() {
        return this.form.controls;
    }

    public async loadUserData() {
        if (this.user.entradaAdmin) {
            this.company = this.user.empresa;
            this.cuentaService.getCuentaUsuarioAdminPorUsuario(this.user.id).subscribe((res: any) => {
                const userDataAdmin = res.datos;
                this.nameUser = userDataAdmin.nombres + ' ' + userDataAdmin.apellidos;
            }, error => {
                this.nameUser = this.user.email;
            });
        } else {
            this.cvService.getPersonalData(this.user.id).subscribe((res: any) => {
                if (res.datos.length > 0) {
                    const userData = res.datos[0];
                    this.nameUser = userData.primerNombre + ' ' + userData.primerApellido;
                } else {
                    this.nameUser = this.user.email;
                }
            }, error => {
                this.nameUser = this.user.email;
            });
        }
    }

    public async openDetailNotification(element: any) {
        this.elementCurrent = C.cloneObject(element);
        // Se actualiza el valor de leido
        const newNotificacion: NotificacionModel = {
            id: element.id,
            asunto: element.asunto,
            mensaje: element.mensaje,
            esLeido: 1,
            idUsuarioDestinatario: element.idUsuarioDestinatario, // lista de ID
            idUsuarioRemitente: element.idUsuarioRemitente,
            idEmpresa: element.idEmpresa ? element.idEmpresa : undefined,
            idConvocatoria: element.idConvocatoria ? element.idConvocatoria : undefined,
        };

        // this.dataMsg = this.sanitizer.bypassSecurityTrustHtml(element.mensaje);
        const plainText = element.mensaje.replace(/<[^>]*>/g, '');
        this.dataMsg = this.sanitizer.bypassSecurityTrustHtml(element.mensaje);
        this.commonService.saveNotificacion(newNotificacion).toPromise()
            .then(record => {

                this.form.patchValue({
                    // id: element.id,
                    idEmpresa: element.idEmpresa,
                    idConvocatoria: element.nombreConvocatoria ? element.nombreConvocatoria : '',
                    asunto: element.asunto,
                    mensaje: plainText,
                });
                this.dialogRefInfo = this.dialogService.open(this.dialogInfo, {
                    maxWidth: '90%',
                    height: '90%',
                  });
                this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-6']);
            }).catch(error => {
                console.log(error);
            });
    }

    public closeDialogInfo() {
        this.loadData();
        this.dialogRefInfo.close();
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    }
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    }
    sidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        } else {
            sidebar.classList.add('active');
        }
        return;


        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            body.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function () {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function () {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            } else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function () {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function () { //asign a function
                body.classList.remove('nav-open');
                this.mobile_menu_visible = 0;
                $layer.classList.remove('visible');
                setTimeout(function () {
                    $layer.remove();
                    $toggle.classList.remove('toggled');
                }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle() {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(1);
        }
        return '';

        for (var item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].path === titlee) {
                return this.listTitles[item].title;
            }
        }
        return '';
    }

    // logout(event) {
    //     event.preventDefault();
    //     this.auth.logout();
    // }
}
