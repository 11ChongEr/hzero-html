import React, { PureComponent } from 'react';
import { Form, Button, DatePicker, Icon, Row, Col, Input, Select } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const dateFormat = getDateFormat();
/**
 * 流程监控查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hwfl/workflow/monitor/list' })
export default class FilterForm extends PureComponent {
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
    const {
      form: { getFieldDecorator, getFieldValue },
      processStatus = [],
    } = this.props;
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
                  label={intl.get('hwfl.common.model.process.status').d('流程状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('processStatus')(
                    <Select>
                      {processStatus.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('hwfl.monitor.view.message.processDefinitionNameLike')
                    .d('流程名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('processDefinitionNameLike')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.apply.owner').d('申请人')}
                  {...formLayout}
                >
                  {getFieldDecorator('startedBy')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('startedAfter')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('startedBefore') &&
                        moment(getFieldValue('startedBefore')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('startedBefore')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('startedAfter') &&
                        moment(getFieldValue('startedAfter')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.monitor.view.message.finishedAfter').d('结束时间从')}
                  {...formLayout}
                >
                  {getFieldDecorator('finishedAfter')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('finishedBefore') &&
                        moment(getFieldValue('finishedBefore')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.monitor.view.message.finishedBefore').d('结束时间至')}
                  {...formLayout}
                >
                  {getFieldDecorator('finishedBefore')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('finishedAfter') &&
                        moment(getFieldValue('finishedAfter')).isAfter(currentDate, 'day')
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
