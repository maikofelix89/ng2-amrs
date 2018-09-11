import { RouterModule, Routes } from '@angular/router';
import { GroupManagerSearchComponent } from './group-manager-search/group-manager-search.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { ModuleWithProviders } from '@angular/core';
import { GroupCreatorComponent } from './group-creator/group-creator-component.ts';

const childRoutes = [
  {path: '', component: GroupManagerSearchComponent},
  {path: 'group/:uuid', component: GroupDetailComponent },
  {path: 'create-group', component: GroupCreatorComponent }
];

export const routes: Routes = [
    {path: 'group-manager', children: childRoutes}
];

export const GroupManagerRouting: ModuleWithProviders = RouterModule.forChild(routes);
