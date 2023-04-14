import { Component, inject } from '@angular/core';
import { StoryList } from '../../models/storylist.model';
import { ContentService } from '../../providers/content.service';
import { APP_ROUTE_TREE } from '../../app-routing.module';

@Component({
  selector: 'cuentoneta-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly appRouteTree = APP_ROUTE_TREE;
  lists: Pick<StoryList, 'title' | 'slug'>[] = [];
  displayMenu: boolean = false;
  constructor() {
    const contentService = inject(ContentService);
    this.lists = contentService.getNavLists();
  }

  onMenuTogglerClicked(event: MouseEvent) {
    this.displayMenu = !this.displayMenu;
  }
}
