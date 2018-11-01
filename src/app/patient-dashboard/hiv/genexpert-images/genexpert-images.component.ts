import { OnInit, OnDestroy, Component, ViewChild } from "@angular/core";
import { GeneXpertResourceService } from "src/app/etl-api/genexpert-images-resource.service";
import { Subscription } from "rxjs";
import { PatientService } from "../../services/patient.service";
import { mergeMap } from "rxjs/operators";
import { ModalDirective } from "ngx-bootstrap";
import { AppSettingsService } from "src/app/app-settings/app-settings.service";

@Component({
    selector: 'genexpert-images',
    templateUrl: './genexpert-images.component.html',
    styleUrls: []
})
export class GeneXpertImagesComponent implements OnInit, OnDestroy {
    subscription: Subscription = new Subscription();
    images = [];
    error = '';
    busy = false;
    resultDate = '';
    public allImages: any = [];
    @ViewChild('imageModal')
    public imageModal: ModalDirective;
    imageLink = '';
    constructor(private patientService: PatientService,
        private geneXpertResourceService: GeneXpertResourceService, private appSettingsService: AppSettingsService) {

    }
    ngOnInit(): void {
        this.subscription.add(this.patientService.currentlyLoadedPatient.subscribe((patient) => {
            if (patient) {
                this.getImages(patient.uuid);
            }
        }))
    }

    getImages(patientUuid) {
        this.busy = true;
        this.subscription.add(this.geneXpertResourceService.getImages(patientUuid).subscribe((images) => {
            this.busy = false;
            this.images = images;
        }, (error) => {
            console.error(error);
            this.busy = false;
            this.error = 'Error Fetching images';
        }));
    }

    showImage(image) {
        this.resultDate = image.obs_datetime;
        this.imageLink = `${image.value_text}`;
        this.imageModal.show();
    }
    ngOnDestroy(): void {

    }
}