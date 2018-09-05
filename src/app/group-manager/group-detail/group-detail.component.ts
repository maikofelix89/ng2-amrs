import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Group} from '../group-model';
import * as _ from 'lodash';
import {CommunityGroupService} from '../../openmrs-api/community-group-resource.service';

@Component({
  selector: 'group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  public group: Group;
  public groupNumber: any;
  public landmark: any;
  public provider: any;
  public leader: any;

  constructor(private activatedRoute: ActivatedRoute, private communityGroupService: CommunityGroupService) {}

  ngOnInit() {
    const groupUuid = this.activatedRoute.snapshot.paramMap.get('uuid');
    if (!_.isEmpty(groupUuid)) {
      this.communityGroupService.getCohortByUuid(groupUuid).subscribe((res) => {
        console.log(res);
        this.groupNumber = this.getAttribute('groupNumber', res.attributes);
        this.landmark = this.getAttribute('landmark', res.attributes);
        this.provider = this.getAttribute('provider', res.attributes);
        this.group = res;
      });
    }
  }
  public getAttribute(attributeType: string, attributes: any[]): any {
    return _.filter(attributes, (attribute) => attribute.cohortAttributeType.name === attributeType)[0];
  }
}
