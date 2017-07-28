import {Injectable} from "@angular/core";
import {Events} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {Geolocation, GeolocationOptions} from "@ionic-native/geolocation";
import {Dictionary, WordingProvider} from "./wording-provider";
import {WebProvider} from "./web-provider";
import {AlertProvider} from "./alert/alert";

/*
 Generated class for the LocationProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class LocationProvider {

  ld: LocationDuple;
  dictionary: Dictionary;
  locationUpdateTimeout = 15000;
  maximumLocationAge = 1800000; // 30 minutes of location cache is allowed.

  constructor(public events: Events, private geolocation: Geolocation, private nativeStorage: NativeStorage, public wordingProvider: WordingProvider, private alertProvider: AlertProvider) {

  }

  public initiate(source: string): Promise<ServiceResponse> {
    this.dictionary = this.wordingProvider.dictionary;
    return new Promise<ServiceResponse>(resolve => {
      if (source != 'dom') {
        this.nativeStorage.getItem('ld').then(data => {
          if (data != null) {
            this.ld = data;
            this.getLocationDupleDevice().then(response => {
              if (response.errorCode == 0) {
                this.ld = response.data;
                resolve(new ServiceResponse(0, this.ld));
                // this.ld.lat = 38.78;
                // this.ld.lng = 34.74; // Yozgat
                this.events.publish('preciseLocationUpdated', this.ld);
                this.saveLocationData(this.ld);
              } else {
                // resolve(new ServiceResponse(2, this.ld));
              }
            });
            resolve(new ServiceResponse(1, this.ld));
          } else {
            resolve(new ServiceResponse(-2, null));
          }
        }, error => {
          console.log("Finding location for the first time...");
          this.events.publish('mainLoadingStatus', this.dictionary.gettingReadyForTheFirstTime);
          this.getLocationDupleDevice().then(response => {
            if (response.errorCode == 0) {
              console.log("Location found successfully...");
              this.ld = response.data;
              this.saveLocationData(this.ld);
              resolve(new ServiceResponse(0, this.ld));
            } else {
              //TODO Push error
              resolve(new ServiceResponse(-1, null));
            }
          });
        });
      } else {
        console.log("Test mode detected. Returning test location data");
        let locationDuple = new LocationDuple();
        locationDuple.lat = 40.979601;
        locationDuple.lng = 29.0878477;
        this.ld = locationDuple;
        resolve(new ServiceResponse(0, this.ld));
      }
    });
  }

  private saveLocationData(ld: LocationDuple): Promise<ServiceResponse> {
    return new Promise<ServiceResponse>(resolve => {
      this.nativeStorage.setItem("ld", ld).then(
        () => {
          console.log('Stored new location:' + ld);
        },
        error => {
          console.log('Failed to fetch new precise location:' + error);
          //TODO push error and show warning.
        }
      );
      resolve(new ServiceResponse(0, null));
    });
  }

  public getLocationDuple(source: string): Promise<ServiceResponse> {
    let options: GeolocationOptions = {
      timeout: this.locationUpdateTimeout,
      maximumAge: this.maximumLocationAge
    };
    return this.getDeviceLocation(source, options);
  }

  private getDeviceLocation(source: string, options: GeolocationOptions) {
    return new Promise<ServiceResponse>(resolve => {
      if ("dom" == source) {
        let locationDuple = new LocationDuple();
        locationDuple.lat = 40.979601;
        locationDuple.lng = 29.0878477;
        this.ld = locationDuple;
        resolve(new ServiceResponse(0, this.ld));
      } else {

        this.geolocation.getCurrentPosition(options).then((resp) => {
          let ld = new LocationDuple();
          ld.lat = resp.coords.latitude;
          ld.lng = resp.coords.longitude;
          resolve(new ServiceResponse(0, ld));
        }).catch((error) => {
          resolve(new ServiceResponse(-2, error.code));
          console.log('Failed to retrieve precise location' + JSON.stringify(error));
          //TODO Push error
        });
      }

    });
  }

  public getLocationDuplePrecise(source: string): Promise<ServiceResponse> {
    let options: GeolocationOptions = {
      timeout: this.locationUpdateTimeout,
    };
    return this.getDeviceLocation(source, options);
  }


  public getLocationDupleDevice(): Promise<ServiceResponse> {
    return this.getLocationDuple("device");
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
