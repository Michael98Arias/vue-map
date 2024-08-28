import HttpService from '../../shared/services/HttpService';
import type { ListVisit } from './interface/Map';

class MapApi {
  public getVisits = (): Promise<ListVisit> => {
    const url = '/visits';
    return HttpService.get(url);
  };

}
export default new MapApi();
