import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import styles from './index.less';

/**
 * 部门维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询=
 * @reactProps {string} companyName - 公司名称
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/hpfm/hr/org/department' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
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
   * 表单重置
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
    const { companyName, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <Fragment>
          <p className={classNames(styles['hpfm-hr-title'])}>
            <span />
            {intl
              .get('hpfm.department.view.message.tips', {
                name: companyName,
              })
              .d(`当前正在为「${companyName}」公司，分配部门`)}
          </p>
        </Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('entity.department.code').d('部门编码')}>
            {getFieldDecorator('unitCode')(<Input trim typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item label={intl.get('entity.department.name').d('部门名称')}>
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
