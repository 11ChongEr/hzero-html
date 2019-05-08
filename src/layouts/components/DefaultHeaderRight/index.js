/**
 * 组合 布局 中 右侧 导航条
 * 语言切换
 * 站内消息
 * 常用功能(租户切换/角色切换/个人中心/退出登录)
 * @date 2019-03-07
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */

import React from 'react';

import DefaultLanguageSelect from '../DefaultLanguageSelect';
import DefaultNoticeIcon from '../DefaultNoticeIcon';
import DefaultCommonSelect from '../DefaultCommonSelect';

class DefaultHeaderRight extends React.Component {
  render() {
    return (
      <React.Fragment>
        <DefaultLanguageSelect key="language-switch" />
        <DefaultNoticeIcon key="notice-message" popupAlign={{ offset: [25, -8] }} />
        <DefaultCommonSelect key="common-switch" />
      </React.Fragment>
    );
  }
}

export default DefaultHeaderRight;
