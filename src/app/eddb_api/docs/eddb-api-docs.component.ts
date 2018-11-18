import { Component, HostBinding } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { IInputSpec } from '../../swagger_ui/swagger-ui.component';

@Component({
    selector: 'app-eddb-api-docs',
    templateUrl: './eddb-api-docs.component.html'
})
export class EddbApiDocsComponent {
    @HostBinding('class.u-main-container') mainContainer = true;
    specs: IInputSpec[];
    constructor(private titleService: Title) {
        this.titleService.setTitle('EDDB API Docs - Elite BGS');
        this.specs = [
            {
                versionName: 'V1',
                specLocation: 'https://eddbapi.kodeblox.com/api/v1/api-docs.json',
                swaggerLocation: 'https://eddbapi.kodeblox.com/api/v1/docs'
            }
        ]
    }
}
