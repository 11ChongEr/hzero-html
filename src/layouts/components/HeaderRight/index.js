/**
 * @date 2019-02-15
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { Spin } from 'hzero-ui';

import NoticeIcon from 'components/NoticeIcon';

import intl from 'utils/intl';
import MenuSelect from 'utils/intl/MenuSelect';
import LocaleSelect from 'utils/intl/LocaleSelect';

import DropdownMenu from '../DropdownMenu';

class HeaderRight extends React.Component {
  render() {
    const { loginName } = this.props;
    return (
      <React.Fragment>
        <MenuSelect key="menu-search" />
        <LocaleSelect key="language-switch" />
        <NoticeIcon
          key="notice-message"
          popupAlign={{ offset: [25, -8] }}
          contentTitle={intl.get('hzero.common.title.userMessage').d('站内消息')}
          emptyText={intl.get('hzero.common.basicLayout.emptyText').d('您已读完所有消息')}
        />
        {loginName ? (
          <DropdownMenu key="user-info" />
        ) : (
          <Spin key="user-info" size="small" style={{ marginLeft: 8 }} />
        )}
      </React.Fragment>
    );
  }
}

export default HeaderRight;
