/**
 * 卡片管理查询表单
 * @date 2019-01-23
 * @author WY yang.wang06@hand-china.com
 * @copyright © HAND 2019
 */

import React from 'react';
import { Form, Input, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

// Select 等 组件需要指定宽度
const fdLevelSelectStyle = {
  width: '200px',
};

/**
 * 卡片管理查询表单
 * @ReactProps {!Function} onRef - 拿到该组件的this
 * @ReactProps {!Function} onSearch - 触发查询方法
 * @ReactProps {Array<{value: string, meaning: string}>} fdLevel - 层级的值集
 */
@Form.create({ fieldNameProp: null })
export default class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const { form, fdLevel } = this.props;
    return (
      <Form layout="inline">
        <Form.Item label={intl.get('hpfm.card.model.card.code').d('卡片代码')}>
          {form.getFieldDecorator('code')(<Input inputChinese={false} />)}
        </Form.Item>
        <Form.Item label={intl.get('hpfm.card.model.card.name').d('卡片名称')}>
          {form.getFieldDecorator('name')(<Input />)}
        </Form.Item>
        {isTenantRoleLevel() || (
          <Form.Item label={intl.get('hpfm.card.model.card.fdLevel').d('层级')}>
            {form.getFieldDecorator('level')(
              <Select style={fdLevelSelectStyle}>
                {(fdLevel || []).map(item => {
                  return (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        )}
        <Form.Item>
          <Button key="search" type="primary" onClick={this.handleSearchBtnClick}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button key="reset" onClick={this.handleResetBtnClick}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  @Bind()
  handleSearchBtnClick() {
    const { onSearch } = this.props;
    onSearch();
  }

  @Bind()
  handleResetBtnClick() {
    const { form } = this.props;
    form.resetFields();
  }
}
