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
 * @reactProps {String} unitName - 部门名称
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/hpfm/hr/org/post/' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 编辑保存前校验
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
    const { unitName, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <Fragment>
          <p className={classNames(styles['hpfm-hr-title'])}>
            <span />
            {intl
              .get('hpfm.position.view.message.tips', {
                name: unitName,
              })
              .d(`当前正在为「${unitName}」部门，分配岗位`)}
          </p>
        </Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('entity.position.code').d('岗位编码')}>
            {getFieldDecorator('positionCode', {})(
              <Input trim typeCase="upper" inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item label={intl.get('entity.position.name').d('岗位名称')}>
            {getFieldDecorator('positionName', {})(<Input />)}
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
