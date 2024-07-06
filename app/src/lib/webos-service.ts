import '@procot/webostv'
import { Observable } from 'rxjs';

/**
 * Helper class to call a webos service throug LUNA
 */
export class WebOSService {
  constructor(
    public readonly serviceName: string
  ) {}

  public async deviceSpecificOperation(device: Device): Promise<void> {
    if (device.name.toLowerCase().includes('xbox')) {
      // Xbox-specific operations
      await this.request('adapter/setDeviceClass', {
        address: device.address,
        deviceClass: 1344 // Xbox controller class
      });
      
      // Set a higher connection timeout for Xbox controllers
      await this.request('adapter/setConnectionTimeout', {
        address: device.address,
        timeout: 60 // 30 seconds
      });
    }
  }

  public async request<Data = any>(method: string, parameters?: Record<string, any>): Promise<Data> {
    return new Promise((resolve, reject) => {
      webOS.service.request(`luna://${this.serviceName}`, {
        method,
        parameters,
        subscribe: false,
        resubscribe: false,
        onSuccess: (success) => {
          resolve(success as any)
        },
        onFailure: (error) => {
          reject(error)
        }
      })
    })
  }

  public subscription<Data = any>(method: string, parameters?: Record<string, any>): Observable<Data> {
    return new Observable((subscriber) => {
      const original = webOS.service.request(`luna://${this.serviceName}`, {
        method,
        parameters,
        subscribe: true,
        resubscribe: false,
        onSuccess: (success) => {
          subscriber.next(success as any)
        },
        onFailure: (error) => {
          subscriber.error(error)
          subscriber.complete()
        }
      })

      subscriber.add(() => {
        original.cancel()
      })
    })
  }
}