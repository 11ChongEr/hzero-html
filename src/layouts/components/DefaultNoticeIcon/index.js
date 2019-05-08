/**
 * @reactProps {!function} fetchCount - 获取消息数量
 * @reactProps {!function} gotoTab - 消息点击事件出发的页面跳转
 * @reactProps {!function} fetchNotices - 获取消息
 */
import React from 'react';
import { Popover, Icon, Badge, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import monent from 'moment';
import classNames from 'classnames';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';

import emptyMessageIcon from '../../../assets/empty-message.png';

import List from './NoticeList';
import styles from './index.less';

const noCountOffset = [-2, 0];
const countLt10Offset = [-2, 4];
const countGt10Offset = [-2, 6];

const popupAlign = { offset: [25, -8] };

class DefaultNoticeIcon extends React.PureComponent {
  static defaultProps = {
    emptyImage: emptyMessageIcon,
  };

  constructor(props) {
    super(props);
    const { title } = props;
    this.state = {
      visible: false,
    };
    if (title) {
      this.state.tabType = title;
    }
  }

  componentDidMount() {
    const { fetchCount } = this.props;
    fetchCount();
  }

  render() {
    const { className, count } = this.props;
    const noticeButtonClass = classNames({
      [className]: true,
      [styles.noticeButton]: true,
      [styles.hasCount]: count > 0,
    });
    let offset = noCountOffset;
    if (count > 9) {
      offset = countGt10Offset;
    } else if (count > 0) {
      offset = countLt10Offset;
    }
    const notificationBox = this.getNotificationBox();
    const { visible } = this.state;
    const bellIconClass = visible ? `${styles['icon-active']} ${styles.icon}` : styles.icon;
    const trigger = (
      <span className={noticeButtonClass}>
        <Badge count={count} className={styles.badge} offset={offset}>
          <Icon className={bellIconClass} />
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    return (
      <Popover
        placement="bottomRight"
        content={notificationBox}
        popupClassName={styles.popover}
        trigger="click"
        arrowPointAtCenter
        popupAlign={popupAlign}
        onVisibleChange={this.handleNoticeVisibleChange}
        visible={visible}
      >
        {trigger}
      </Popover>
    );
  }

  /**
   * 点击查看更多跳转页面
   */
  @Bind()
  handleNoticeList(e) {
    e.preventDefault();
    const { gotoTab } = this.props;
    gotoTab({ pathname: `/hmsg/user-message/list` });
    this.setState({ visible: false });
  }

  /**
   * 点击每一行跳转到详情界面
   */
  handleItemClick = item => {
    const { gotoTab } = this.props;
    gotoTab({ pathname: `/hmsg/user-message/detail/${item.id}` });
    this.setState({ visible: false });
  };

  handleNoticeVisibleChange = visible => {
    const { fetchNotices } = this.props;
    this.setState({ visible });
    if (visible) {
      fetchNotices();
    }
  };

  onTabChange = tabType => {
    this.setState({ tabType });
    this.props.onTabChange(tabType);
  };

  getNotificationBox() {
    const { fetchingNotices: loading, locale, ...childProps } = this.props;
    if (isEmpty(childProps)) {
      return null;
    }
    const { notices, emptyImage, title } = childProps;

    const newNotices =
      notices &&
      notices.map(item => {
        return {
          id: item.messageId,
          title: item.subject,
          datetime: monent(item.creationDate).fromNow(),
          // avatar: messageIcon,
        };
      });

    const panes = (
      <List
        data={newNotices}
        onClick={this.handleItemClick}
        onClear={() => this.props.onClear(title)}
        onMore={this.handleNoticeList}
        locale={locale}
        // 以下为item的内容
        title={title}
        emptyText={intl.get('hzero.common.basicLayout.emptyText').d('您已读完所有消息')}
        emptyImage={emptyImage}
        contentTitle={intl.get('hzero.common.title.userMessage').d('站内消息')}
        contentTitleAction={
          <a onClick={this.handleNoticeList}>
            {intl.get('hzero.common.basicLayout.gotoUserMessage').d('进入消息中心')}
          </a>
        }
      />
    );
    return (
      <Spin spinning={loading} delay={0}>
        {panes}
      </Spin>
    );
  }
}

export default connect(
  ({ global = {}, loading }) => ({
    count: global.count,
    notices: global.notices,
    fetchingNotices: loading.effects['global/fetchNotices'],
  }),
  dispatch => ({
    // 查询消息列表
    fetchNotices: () => {
      return dispatch({
        type: 'global/fetchNotices',
      });
    },
    // 跳转到页面
    gotoTab: (location, state) => {
      return dispatch(routerRedux.push(location, state));
    },
    // 获取消息数量
    fetchCount: () => {
      return dispatch({
        type: 'global/fetchCount',
      });
    },
  })
)(DefaultNoticeIcon);
