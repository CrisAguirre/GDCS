export interface MessageEmitter {
    showProggressBar: boolean;
}

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class?: string;
    childs?: RouteInfo[];
  }