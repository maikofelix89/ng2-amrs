import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ConfirmDialogModule , DialogModule
  } from 'primeng/primeng';
import { GroupManagerSearchComponent } from './group-manager-search/group-manager-search.component';
import { CommunityGroupService } from '../openmrs-api/community-group-resource.service';
import { FormsModule } from '@angular/forms';
import { GroupManagerSearchResultsComponent } from './group-manager-search/group-manager-search-results.component';
import { NgamrsSharedModule } from '../shared/ngamrs-shared.module';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupManagerRouting } from './group-manager.routes';
import { GroupCreatorComponent } from './group-creator/group-creator-component.ts';


@NgModule({
    declarations: [
        GroupManagerSearchComponent,
        GroupManagerSearchResultsComponent,
        GroupDetailComponent,
        GroupCreatorComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgamrsSharedModule,
        GroupManagerRouting,
        ConfirmDialogModule,
        DialogModule
     ],
    exports: [],
    providers: [
        CommunityGroupService
    ],
})
export class GroupManagerModule {}
