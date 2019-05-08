/**
 * Filter - 搜索框
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import styles from './index.less';

/**
 *  页面搜索框
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 搜索方法
 * @reactProps {String} groupCode - 集团编码
 * @reactProps {String} groupName - 集团名称
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/hpfm/hr/org/company' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单搜索
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 搜索表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { groupName, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <Fragment>
          <p className={classNames(styles['hpfm-hr-title'])}>
            <span />
            {intl
              .get('hpfm.organization.view.message.tips', {
                name: groupName,
              })
              .d(`当前正在为「${groupName}」集团，分配组织`)}
          </p>
        </Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('entity.organization.code').d('组织编码')}>
            {getFieldDecorator('unitCode')(<Input typeCase="upper" trim inputChinese={false} />)}
          </Form.Item>
          <Form.Item label={intl.get('entity.organization.name').d('组织名称')}>
            {getFieldDecorator('unitName')(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
