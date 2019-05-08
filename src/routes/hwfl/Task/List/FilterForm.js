import React, { PureComponent } from 'react';
import { Form, Button, DatePicker, Input, Select, Row, Col, Icon } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};
const dateFormat = getDateFormat();
/**
 * 待办事项列表查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hwfl/workflow/task/list' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    this.state = {
      display: true,
    };
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { display = true } = this.state;

    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.ID').d('流程ID')}
                  {...formLayout}
                >
                  {getFieldDecorator('processInstanceId')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.name').d('流程名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('processDefinitionNameLike', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.apply.owner').d('申请人')}
                  {...formLayout}
                >
                  {getFieldDecorator('assignee')(<Input />)}
                </Form.Item>
              </Col>
            </Row>

            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.priority').d('优先级')} {...formLayout}>
                  {getFieldDecorator('priority')(
                    <Select>
                      <Select.Option key="low">
                        {intl.get('hzero.common.priority.low').d('低')}
                      </Select.Option>
                      <Select.Option key="medium">
                        {intl.get('hzero.common.priority.medium').d('中')}
                      </Select.Option>
                      <Select.Option key="high">
                        {intl.get('hzero.common.priority.high').d('高')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdAfter')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('createdBefore') &&
                        moment(getFieldValue('createdBefore')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建时间至')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdBefore')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('createdAfter') &&
                        moment(getFieldValue('createdAfter')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <a
                style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
              </a>
              <a
                style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
              </a>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
