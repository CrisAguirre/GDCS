import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeFunctionService {

  constructor() { }

  flatJsonArray(flattenedAray: Array<TreeData>, node: TreeData[]) {
    const array: Array<TreeData> = flattenedAray;
    node.forEach(element => {
      if (element.Children) {
        array.push(element);
        this.flatJsonArray(array, element.Children);
      }
    });
    return array;
  }

  findNodeMaxId(node: TreeData[]) {
    const flatArray = this.flatJsonArray([], node);
    const flatArrayWithoutChildren = [];
    flatArray.forEach(element => {
      flatArrayWithoutChildren.push(element.Id);
    });
    return Math.max(...flatArrayWithoutChildren);
  }

  findPosition(id: number, data: TreeData[]) {
    for (let i = 0; i < data.length; i += 1) {
      if (id === data[i].Id) {
        return i;
      }
    }
  }

  findFatherNode(id: number, data: TreeData[]) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < data.length; i += 1) {
      const currentFather = data[i];
      for (let z = 0; z < currentFather.Children.length; z += 1) {
        if (id === currentFather.Children[z]['Id']) {
          return [currentFather, z];
        }
      }
      // tslint:disable-next-line: prefer-for-of
      for (let z = 0; z < currentFather.Children.length; z += 1) {
        if (id !== currentFather.Children[z]['Id']) {
          const result = this.findFatherNode(id, currentFather.Children);
          if (result !== false) {
            return result;
          }
        }
      }
    }
    return false;
  }
}

export interface TreeData {
  Id: number;
  Name: string;
  Description: string;
  Children: TreeData[];
}

export interface DialogData {
  Name: string;
  Description: string;
  Component: string;
}
