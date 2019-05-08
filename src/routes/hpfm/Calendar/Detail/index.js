/**
 * Calendar - 平台级日历维护
 * @date: 2018-9-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, includes, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { createPagination, getDateFormat, getCurrentOrganizationId } from 'utils/utils';

import Holidays from './Holidays';
import Weekdays from './Weekdays';
import Drawer from './Drawer';
import styles from './index.less';
@connect(({ calendar, loading }) => ({
  calendar,
  tenantId: getCurrentOrganizationId(),
  holidayLoading: loading.effects['calendar/searchHolidays'],
  weekdayLoading: loading.effects['calendar/searchWeekdays'],
}))
@formatterCollections({ code: ['hpfm.calendar'] })
export default class Detail extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      dateFormat: getDateFormat(),
    };
  }

  /**
   * render()调用后获取展示数据
   */
  componentDidMount() {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchCalendarDetail',
      payload: {
        tenantId,
        calendarId: params.calendarId,
      },
    });
    dispatch({
      type: 'calendar/searchHolidayType',
    });
    this.handleSearchHoliday();
    this.handleSearchWeekday();
  }

  /**
   * 公休假期查询
   */
  @Bind()
  handleSearchHoliday(page = {}) {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchHolidays',
      payload: {
        tenantId,
        calendarId: params.calendarId,
        page,
      },
    });
  }

  /**
   * 工作日查询
   */
  @Bind()
  handleSearchWeekday() {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchWeekdays',
      payload: {
        tenantId,
        calendarId: params.calendarId,
      },
    });
  }

  /**
   * 新增公休假期行
   */
  @Bind()
  handleAddOption() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 保存工作日信息
   */
  @Bind()
  handleSaveOption() {
    const {
      dispatch,
      match,
      calendar: { weekdays },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/updateWeekday',
      payload: {
        tenantId,
        calendarId: match.params.calendarId,
        data: [...weekdays],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchWeekday();
      }
    });
  }

  /**
   * 批量删除公休假期
   */
  @Bind()
  handleDeleteOption() {
    const {
      dispatch,
      match,
      calendar: { holidays },
      tenantId,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const selectedRows = holidays.content.filter(item => includes(selectedRowKeys, item.holidayId));
    dispatch({
      type: 'calendar/deleteHolidays',
      payload: {
        tenantId,
        calendarId: match.params.calendarId,
        data: selectedRows,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchHoliday();
      }
    });
  }

  /**
   * 切换TabPane
   * @param {string} key - 激活pane key
   */
  @Bind()
  handleChangePane(key) {
    this.setState({ display: key === '1' && true });
  }

  /**
   * 工作日选中状态变更
   * @param {number} value - 变更值
   * @param {number} weekdayId - 工作日Id
   */
  @Bind()
  handleChangeWeekday(value, weekdayId) {
    const {
      dispatch,
      calendar: { weekdays },
    } = this.props;
    dispatch({
      type: 'calendar/updateState',
      payload: {
        weekdays: weekdays.map(item =>
          item.weekdayId === weekdayId ? { ...item, weekdayFlag: value } : { ...item }
        ),
      },
    });
  }

  /**
   * Drawer Close
   */
  @Bind()
  handleModalCancel() {
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 保存/更新公休假期信息
   * @param {object} values - 公休假期(行)对象
   */
  @Bind()
  handleModalOk(values) {
    const { dispatch, match, tenantId } = this.props;
    dispatch({
      type: isUndefined(values.holidayId) ? 'calendar/addHoliday' : 'calendar/updateHoliday',
      payload: {
        tenantId,
        calendarId: match.params.calendarId,
        data: { ...values, calendarId: match.params.calendarId },
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchHoliday();
        this.setState({ targetItem: {}, drawerVisible: false });
      }
    });
  }

  /**
   * 公休假期(行)选中状态变更
   */
  @Bind()
  handleSelectRow(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dateFormat,
      display = true,
      targetItem = {},
      selectedRowKeys = [],
      drawerVisible = false,
    } = this.state;
    const {
      holidayLoading,
      weekdayLoading,
      calendar: { calendarDetail = {}, holidays = [], weekdays = [], holidayType = [] },
    } = this.props;
    const holidaysProps = {
      dateFormat,
      selectedRowKeys,
      loading: holidayLoading,
      dataSource: holidays.content,
      pagination: createPagination(holidays),
      onSelect: this.handleSelectRow,
      onSearch: this.handleSearchHoliday,
    };
    const weekdaysProps = {
      dataSource: weekdays,
      loading: weekdayLoading,
      onChange: this.handleChangeWeekday,
    };
    const drawerProps = {
      targetItem,
      dateFormat,
      holidayType,
      title: intl.get('hpfm.calendar.view.message.maintain').d('公共假期维护'),
      visible: drawerVisible,
      anchor: 'right',
      onCancel: this.handleModalCancel,
      onOk: this.handleModalOk,
    };
    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护')}
          backPath="/hpfm/mdm/calendar"
        >
          <Button
            icon="plus"
            type="primary"
            onClick={this.handleAddOption}
            style={{ display: display ? 'block' : 'none' }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            onClick={this.handleDeleteOption}
            style={{ display: display ? 'block' : 'none' }}
            disabled={isEmpty(selectedRowKeys)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSaveOption}
            style={{ display: display ? 'none' : 'block' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className={classNames(styles['mdm-detail'])}>
            <div className={classNames(styles['mdm-line'])}>
              <span className={classNames(styles['mdm-label'])}>
                {intl.get('hpfm.calendar.model.calendar.calendarName').d('描述')}:
              </span>
              <span className={classNames(styles['mdm-input'])}>{calendarDetail.calendarName}</span>
            </div>
            <div className={classNames(styles['mdm-line'])}>
              <span className={classNames(styles['mdm-label'])}>
                {intl.get('hpfm.calendar.model.calendar.country').d('国家/地区')}:
              </span>
              <span className={classNames(styles['mdm-input'])}>{calendarDetail.countryName}</span>
            </div>
          </div>
          <Tabs type="card" onChange={this.handleChangePane}>
            <Tabs.TabPane
              key="1"
              tab={intl.get('hpfm.calendar.view.message.maintain').d('公共假期维护')}
            >
              <Holidays {...holidaysProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              key="2"
              tab={intl.get('hpfm.calendar.view.message.weekday').d('工作日分配')}
            >
              <Weekdays {...weekdaysProps} />
            </Tabs.TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
        </Content>
      </Fragment>
    );
  }
}
