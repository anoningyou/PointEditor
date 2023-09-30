import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

declare var require: any;
const {XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PointEditor';
  file: any;
  fileName: string = ""
  displayedColumns: string[] = ["name", "lat", "lon"]

  constructor(private toastr: ToastrService) {}

  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
  
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        let xml = e.target.result;
        const options = {
          ignoreAttributes : false
        };
        const parser = new XMLParser(options);
        const data = parser.parse(xml);
        if (!data.gpx) {
          this.toastr.error("File isn't gpx")
          return;
        }

        if (!this.file){
          this.file = data;
          if (!this.file.gpx.wpt)
            this.file.gpx.wpt = [];
          this.toastr.success(`New file was loaded`);
        }
        else if (data.gpx?.wpt?.length){
          const oldList = this.file.gpx.wpt as any[];
          const newList = data.gpx.wpt as any[];
          const pointsToAdd = newList.filter(p => 
            !oldList.find(w => 
                 w["name"] === p["name"] 
              && w["@_lat"] === p["@_lat"] 
              && w["@_lon"] === p["@_lon"])
          );
          if (pointsToAdd.length){
            this.file.gpx.wpt = oldList.concat(pointsToAdd);
            this.toastr.success(`${pointsToAdd.length} points were added`);
          }
          else
            this.toastr.info("File has no new points");
        }
        else {
          this.toastr.info("File has no points");
        }
      }
      reader.readAsText(inputNode.files[0])
    }
  }

  onClean(){
    this.file = null;
  }

  onSave() {
    const options = {
      ignoreAttributes : false
    };
    
    const builder = new XMLBuilder(options);
    let xmlDataStr = builder.build(this.file);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlDataStr));
    element.setAttribute('download', `${this.fileName}.gpx`);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
}
