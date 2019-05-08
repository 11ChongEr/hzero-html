import React, { PureComponent } from 'react';
import { Form, Button, DatePicker, Row, Col, Input } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const dateFormat = getDateFormat();

/**
 * 报错日志查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
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
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
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

    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建时间从')}
                  {...formLayout}
                >
                  {getFieldDecorator('after')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('before') &&
                        moment(getFieldValue('before')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('before')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('after') &&
                        moment(getFieldValue('after')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.name').d('流程名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('procDefName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.ID').d('流程ID')}
                  {...formLayout}
                >
                  {getFieldDecorator('procId')(<Input />)}
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
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
