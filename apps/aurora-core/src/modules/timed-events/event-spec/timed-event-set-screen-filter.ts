import { ScreenFilterParams } from '../../screen-filter/screen-filter-manager';

type TimedEventSetScreenFilter = {
  type: 'timed-event-set-screen-filter';
  params: ScreenFilterParams;
};

export default TimedEventSetScreenFilter;
