import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ParkService } from 'src/app/services/park.service';
import { BaseFormComponent } from 'src/app/shared/components/ds-forms/base-form/base-form.component';
import { modalSchema } from 'src/app/shared/components/modal/modal.component';
import { Constants } from 'src/app/shared/utils/constants';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-faq-edit',
  templateUrl: './faq-edit.component.html',
  styleUrls: ['./faq-edit.component.scss'],
})
// export class FaqComponent implements OnInit {
//   constructor() { }

//   ngOnInit(): void {
//   }
// }


export class FaqEditComponent extends BaseFormComponent {
  public park;
  public isEditMode = new BehaviorSubject<boolean>(true);
  public parkEditModal: modalSchema;
  public parkEditModalRef: BsModalRef;
  private utils = new Utils();
  public faqName = "FAQ"

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected dataService: DataService,
    protected loadingService: LoadingService,
    protected changeDetector: ChangeDetectorRef,
    private parkService: ParkService,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    super(formBuilder, router, dataService, loadingService, changeDetector);
    this.subscriptions.add(
      dataService.watchItem(Constants.dataIds.CURRENT_PARK_KEY).subscribe((res) => {
        if (res) {
          this.park = this.parkService.getCachedPark(res);
          this.data = this.park;
          this.setForm();
        }
      })
    );
    this.setForm();
  }

  setForm() {
  }

  async onSubmit() {
    
  }

  submitParkChanges(postObj) {

  }
  
  onFormReset() {
    super.reset();
    this.setForm();
  }

  // Format form fields for API submission
  formatFormResults(results) {
    const postObj = {
      park: {
        name: results.parkName,
        orcs: results.parkOrcs,
        bcParksLink: results.parkSiteLink,
        mapLink: results.parkMapLink,
        videoLink: results.parkVideoLink,
        status: results.parkStatus === true ? 'open' : 'closed',
        capacity: results.parkCapacity,
      },
      description: results.parkDescription,
      visible: results.parkVisibility,
    };
    return postObj;
  }

 



}
