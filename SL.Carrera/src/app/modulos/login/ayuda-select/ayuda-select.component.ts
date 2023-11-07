import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseController } from '@app/compartido/helpers/base-controller';

@Component({
  selector: 'app-ayuda-select',
  templateUrl: './ayuda-select.component.html',
  styleUrls: ['./ayuda-select.component.scss']
})
export class AyudaSelectComponent extends BaseController implements OnInit {

  public lstAyuda = [
    {
      title: 'ttl.manualDeUso',
      href: 'manual'
    },
    {
      title: 'ttl.videoTutoriales',
      href: 'tutorial'
    },
    {
      title: 'ttl.faq',
      href: 'faq'
    }
  ];
  public itemCurrent: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
  }

  public change(item) {
    this.itemCurrent = item;
    this.router.navigate(['help', item.href], { relativeTo: this.route });
  }
}
