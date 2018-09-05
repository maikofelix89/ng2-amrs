import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupManagerSearchComponent } from './group-manager-search/group-manager-search.component';
import { CommunityGroupService } from '../openmrs-api/community-group-resource.service';
import { FormsModule } from '@angular/forms';
import { GroupManagerSearchResultsComponent } from './group-manager-search/group-manager-search-results.component';
import { NgamrsSharedModule } from '../shared/ngamrs-shared.module';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupManagerRouting } from './group-manager.routes';

@NgModule({
    declarations: [
        GroupManagerSearchComponent,
        GroupManagerSearchResultsComponent,
        GroupDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgamrsSharedModule,
        GroupManagerRouting
     ],
    exports: [],
    providers: [
        CommunityGroupService
    ],
})
export class GroupManagerModule {}
