import React, { PureComponent } from 'react';
import { Form, Input, Button, Icon, DatePicker, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      timeFormat: getDateTimeFormat(),
    };
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

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const prefix = 'hpfm.login.audit.model';
    const { form } = this.props;
    const { expandForm, timeFormat } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item {...formItemLayout} label={intl.get(`${prefix}.account`).d('账号')}>
                    {getFieldDecorator('loginName', {})(<Input trim inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${prefix}.description`).d('描述')}
                  >
                    {getFieldDecorator('userName', {})(<Input trim />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item {...formItemLayout} label={intl.get(`${prefix}.phone`).d('手机号')}>
                    {getFieldDecorator('phone', {})(<Input trim inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: expandForm ? 'block' : 'none' }}>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${prefix}.login.time.after`).d('登录时间从')}
                  >
                    {getFieldDecorator('loginDateAfter')(
                      <DatePicker
                        showTime
                        placeholder=""
                        format={timeFormat}
                        disabledDate={currentDate =>
                          getFieldValue('loginDateBefore') &&
                          moment(getFieldValue('loginDateBefore')).isBefore(currentDate, 'second')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${prefix}.login.time.before`).d('登录时间至')}
                  >
                    {getFieldDecorator('loginDateBefore')(
                      <DatePicker
                        showTime
                        placeholder=""
                        format={timeFormat}
                        disabledDate={currentDate =>
                          getFieldValue('loginDateAfter') &&
                          moment(getFieldValue('loginDateAfter')).isAfter(currentDate, 'second')
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
                <a style={{ marginLeft: 8, display: 'inline-block' }} onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                  <Icon type={expandForm ? 'up' : 'down'} />
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
