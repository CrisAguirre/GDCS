import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length == 0 || pageSize == 0) { return `0 ${CustomTranslateService.OF} ${length}`; }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} ${CustomTranslateService.OF} ${length}`;
}


export function getDutchPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();
  
  paginatorIntl.itemsPerPageLabel = CustomTranslateService.PAGINATOR_ITEM_PER_PAGE;
  paginatorIntl.nextPageLabel = CustomTranslateService.PAGINATOR_NEXT;
  paginatorIntl.lastPageLabel = CustomTranslateService.PAGINATOR_LAST;
  paginatorIntl.previousPageLabel = CustomTranslateService.PAGINATOR_BACK;
  paginatorIntl.firstPageLabel = CustomTranslateService.PAGINATOR_FIRST;
  paginatorIntl.getRangeLabel = dutchRangeLabel;

  return paginatorIntl;
}

export class CustomPaginator {
  constructor(private ct: CustomTranslateService) {
    //console.log('TEST', this.ct.WE_ARE_SORRY);
  }
}