import {Injectable} from "@angular/core";
import {Events, Platform} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {Geolocation} from "@ionic-native/geolocation";

/*
 Generated class for the LocationProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class LocationProvider {

  ld: LocationDuple;

  constructor(public platform: Platform, public events: Events, private geolocation: Geolocation, private nativeStorage: NativeStorage) {

  }

  public initiate(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      this.platform.ready().then(() => {
        this.nativeStorage.getItem('location').then(data => {
          if (data != null) {
            this.ld = data.ld;
            resolve(new ServiceResponse(1, this.ld));
            this.getLocationDuple().then(response => {
              if (response.errorCode == 0) {
                this.ld = response.data;
                resolve(new ServiceResponse(0, this.ld));
                this.saveLocationData(this.ld);
              } else {
                resolve(new ServiceResponse(2, this.ld));
              }
            });
          }
        }, error => {
          this.events.publish('mainLoadingStatus', 'Preparing application for first use');
          this.getLocationDuple().then(response => {
            if (response.errorCode == 0) {
              this.ld = response.data;
              resolve(new ServiceResponse(0, this.ld));
              this.saveLocationData(this.ld);
            } else {
              //TODO Push error
              resolve(new ServiceResponse(-1, null));
            }
          });
        });
      });
    });
  }

  private saveLocationData(ld: LocationDuple): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      this.nativeStorage.setItem("ld", ld);
      resolve(new ServiceResponse(0, null));
    });
  }

  private getLocationDuple(): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      this.geolocation.getCurrentPosition().then((resp) => {
        let ld = new LocationDuple();
        ld.lat = resp.coords.latitude;
        ld.lng = resp.coords.longitude;
        resolve(new ServiceResponse(0, ld));
      }).catch((error) => {
        resolve(new ServiceResponse(-2, null));
        console.log('Failed to retrieve precise location' + error);
        //TODO Push error
      });
    });
  }

}

export class LocationDuple {
  lat: number;
  lng: number;

  constructor() {
  }
}

export class ServiceResponse {
  errorCode: number;
  data: any;

  constructor(errCode: number, data: any) {
    this.errorCode = errCode;
    this.data = data;
  }
}
