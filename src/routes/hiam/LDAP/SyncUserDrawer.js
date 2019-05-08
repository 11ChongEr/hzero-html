import React from 'react';
import { Modal, Spin, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import styles from './index.less';

let timer = null;
export default class Drawer extends React.PureComponent {
  // 查询同步用户数据
  @Bind()
  getSyncInfoOnce() {
    const { ldapData, tenantId, dispatch } = this.props;
    dispatch({
      type: 'ldap/fetchSyncInfo',
      payload: {
        tenantId,
        id: ldapData.id,
      },
    }).then(res => {
      if (res) {
        window.clearInterval(timer);
      }
    });
  }

  // 定时查询同步用户数据
  @Bind()
  loading() {
    window.clearInterval(timer);
    timer = window.setInterval(this.getSyncInfoOnce, 9000);
    return this.renderLoading();
  }

  // 渲染同步提示区域内容
  @Bind()
  renderLoading() {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['connect-loader']}>
          <Spin size="large" />
        </div>
        <p className={styles['loading-text']}>
          {intl.get('hiam.ldap.view.message.sync.loading').d('正在同步中')}
        </p>
        <p className={styles['tip-text']}>
          {intl
            .get('hiam.ldap.view.message.sync.loading.tip')
            .d('(本次同步将会耗时较长，您可以先返回页面进行其他操作)')}
        </p>
        {this.renderAbortButton()}
      </div>
    );
  }

  // 确定
  @Bind()
  handleOk() {
    const { onOk } = this.props;
    if (onOk) {
      onOk();
    }
  }

  // 取消
  @Bind()
  handleCancel() {
    window.clearInterval(timer);
    this.props.onCancel();
  }

  // 强行终止
  @Bind()
  handleAbort() {
    const {
      dispatch,
      tenantId,
      ldap: { ldapData = {} },
    } = this.props;
    Modal.confirm({
      title: intl.get('hiam.ldap.view.message.confirm').d('确认'),
      content: intl
        .get('hiam.ldap.view.message.abort.content')
        .d('您的同步似乎已经超出正常同步的时间，确定要强制终止同步吗？终止之后您可以重新同步'),
      onOk: () => {
        dispatch({
          type: 'ldap/stopSyncUser',
          payload: {
            tenantId,
            id: ldapData.id,
          },
        }).then(res => {
          if (res) {
            notification.success();
          }
        });
      },
    });
  }

  // 渲染强行终止按钮
  @Bind()
  renderAbortButton() {
    const { syncInfoData } = this.props;
    const passTime = new Date() - new Date(syncInfoData.syncBeginTime);
    if (syncInfoData.syncEndTime === null && passTime / 1000 > 3600) {
      return (
        <Button
          type="primary"
          style={{ backgroundColor: '#f44336', margin: '0 auto', display: 'inherit' }}
          onClick={this.handleAbort}
        >
          {intl.get('hiam.ldap.option.button.abort').d('强制终止')}
        </Button>
      );
    }
    return null;
  }

  // 格式化时间
  getSpentTime = (startTime, endTime) => {
    const timeUnit = {
      day: intl.get('entity.time.time.day').d('日'),
      hour: intl.get('entity.time.time.hour').d('时'),
      minute: intl.get('entity.time.time.minute').d('分'),
      second: intl.get('entity.time.time.second').d('秒'),
    };
    const spentTime = new Date(endTime).getTime() - new Date(startTime).getTime(); // 时间差的毫秒数
    // 天数
    const days = Math.floor(spentTime / (24 * 3600 * 1000));
    // 小时
    const leave1 = spentTime % (24 * 3600 * 1000); //  计算天数后剩余的毫秒数
    const hours = Math.floor(leave1 / (3600 * 1000));
    // 分钟
    const leave2 = leave1 % (3600 * 1000); //  计算小时数后剩余的毫秒数
    const minutes = Math.floor(leave2 / (60 * 1000));
    // 秒数
    const leave3 = leave2 % (60 * 1000); //  计算分钟数后剩余的毫秒数
    const seconds = Math.round(leave3 / 1000);
    const resultDays = days ? days + timeUnit.day : '';
    const resultHours = hours ? hours + timeUnit.hour : '';
    const resultMinutes = minutes ? minutes + timeUnit.minute : '';
    const resultSeconds = seconds ? seconds + timeUnit.second : '';
    return resultDays + resultHours + resultMinutes + resultSeconds;
  };

  // 渲染同步区域内容
  @Bind()
  renderSyncContent() {
    const { syncInfoData } = this.props;
    if (isEmpty(syncInfoData)) {
      return (
        <div className="syncContainer">
          <p>{intl.get('hiam.ldap.view.message.noSyncInfo').d('当前没有同步用户记录')}</p>
        </div>
      );
    } else if (syncInfoData && syncInfoData.syncEndTime) {
      return (
        <div className="syncContainer">
          <p>
            {intl.get('hiam.ldap.view.message.sync.lastTime').d('上次同步时间')}{' '}
            {syncInfoData.syncEndTime}
          </p>
          <p>
            time: {this.getSpentTime(syncInfoData.syncBeginTime, syncInfoData.syncEndTime)}, count:{' '}
            {syncInfoData.updateUserCount + syncInfoData.newUserCount}
          </p>
        </div>
      );
    }
  }

  render() {
    const { syncUserVisible, syncLoading } = this.props;

    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        keyboard={false}
        closable={false}
        title={intl.get('hiam.ldap.option.syncUser').d('同步用户')}
        width={520}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={syncUserVisible}
        confirmLoading={syncLoading}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        footer={[
          <Button key="cancel" onClick={this.handleCancel} disabled={syncLoading}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button type="primary" key="save" onClick={this.handleOk}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        {syncLoading ? this.loading() : this.renderSyncContent()}
      </Modal>
    );
  }
}
