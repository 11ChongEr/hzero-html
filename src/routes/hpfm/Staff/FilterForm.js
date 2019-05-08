import React, { PureComponent, Fragment } from 'react';
import { Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import OptionInput from 'components/OptionInput';
import intl from 'utils/intl';

/**
 *  页面搜索框
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onFilterChange - 查询
 * @reactProps {String} locate - form位置
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
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
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const queryArray = [
      {
        queryLabel: intl.get('entity.employee.code').d('员工编码'),
        queryName: 'employeeNum',
        inputProps: {
          trim: true,
          typeCase: 'upper',
          inputChinese: false,
        },
      },
      {
        queryLabel: intl.get('entity.employee.name').d('员工姓名'),
        queryName: 'name',
      },
    ];
    return (
      <Fragment>
        <Form layout="inline">
          <Form.Item>
            {getFieldDecorator('option')(
              <OptionInput style={{ width: '300px' }} queryArray={queryArray} />
            )}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" htmlType="submit" type="primary" onClick={this.handleSearch}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
