import React, { PureComponent } from 'react';
import { Form, Button, Select, Input, Row, Col, Icon, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getDateTimeFormat, isTenantRoleLevel } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} fetchMessageList - 查询
 * @reactProps {Function} onStoreFormValues - 存储表单值
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class Filter extends PureComponent {
  state = {
    display: true,
  };

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch, onStoreFormValues } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        let values = { ...fieldsValue };
        values = {
          fromCreateDate: fieldsValue.fromCreateDate
            ? fieldsValue.fromCreateDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          toCreateDate: fieldsValue.toCreateDate
            ? fieldsValue.toCreateDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
        };
        onSearch({ ...fieldsValue, ...values });
        onStoreFormValues({ ...fieldsValue, ...values });
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
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

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { fileFormatList = [], fileTypeList = [], fileUnitList = [] } = this.props;
    const { display } = this.state;
    const fileMinUnitSelector = getFieldDecorator('fileMinUnit', {
      initialValue: 'KB',
    })(
      <Select style={{ width: '65px' }}>
        {fileUnitList &&
          fileUnitList.map(item => (
            <Option value={item.value} key={item.value}>
              {item.meaning}
            </Option>
          ))}
      </Select>
    );
    const fileMaxUnitSelector = getFieldDecorator('fileMaxUnit', {
      initialValue: 'KB',
    })(
      <Select style={{ width: '65px' }}>
        {fileUnitList &&
          fileUnitList.map(item => (
            <Option value={item.value} key={item.value}>
              {item.meaning}
            </Option>
          ))}
      </Select>
    );
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              {!isTenantRoleLevel() && (
                <Col span={8}>
                  <FormItem
                    label={intl.get('hfile.fileAggregate.model.fileAggregate.tenantId').d('租户')}
                    {...formLayout}
                  >
                    {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                  </FormItem>
                </Col>
              )}
              <Col span={8}>
                <FormItem
                  label={intl.get('hfile.fileAggregate.model.fileAggregate.bucketName').d('分组')}
                  {...formLayout}
                >
                  {getFieldDecorator('bucketName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hfile.fileAggregate.model.fileAggregate.fileType').d('文件类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('fileType')(
                    <Select allowClear>
                      {fileTypeList &&
                        fileTypeList.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Row style={{ display: display ? 'none' : 'block' }} type="flex">
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hfile.fileAggregate.model.fileAggregate.attachmentUUID')
                      .d('批号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('attachmentUUID')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hfile.fileAggregate.model.fileAggregate.fileName').d('文件名')}
                    {...formLayout}
                  >
                    {getFieldDecorator('fileName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hfile.fileAggregate.model.fileAggregate.fileFormat')
                      .d('文件格式')}
                    {...formLayout}
                  >
                    {getFieldDecorator('fileFormat')(
                      <Select allowClear>
                        {fileFormatList &&
                          fileFormatList.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hzero.common.time.creation.from').d('创建时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('fromCreateDate')(
                      <DatePicker
                        showTime
                        placeholder=""
                        format={getDateTimeFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('toCreateDate') &&
                          moment(getFieldValue('toCreateDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hzero.common.time.creation.to').d('创建时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('toCreateDate')(
                      <DatePicker
                        showTime
                        placeholder=""
                        format={getDateTimeFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('fromCreateDate') &&
                          moment(getFieldValue('fromCreateDate')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hfile.fileAggregate.model.fileAggregate.realName').d('上传人')}
                    {...formLayout}
                  >
                    {getFieldDecorator('realName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hfile.fileAggregate.model.fileAggregate.fileMinSize')
                      .d('文件最小')}
                    {...formLayout}
                  >
                    {getFieldDecorator('fileMinSize', {
                      rules: [
                        {
                          min: 0,
                          pattern: /^\d+$/,
                          message: intl
                            .get('hfile.fileAggregate.view.message.patternValidate')
                            .d('请输入大于等于0的整数'),
                        },
                      ],
                    })(<Input type="number" addonAfter={fileMinUnitSelector} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hfile.fileAggregate.model.fileAggregate.fileMaxSize')
                      .d('文件最大')}
                    {...formLayout}
                  >
                    {getFieldDecorator('fileMaxSize', {
                      rules: [
                        {
                          min: 0,
                          pattern: /^\d+$/,
                          message: intl
                            .get('hfile.fileAggregate.view.message.patternValidate')
                            .d('请输入大于等于0的整数'),
                        },
                      ],
                    })(<Input type="number" addonAfter={fileMaxUnitSelector} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hfile.fileAggregate.model.fileAggregate.directory')
                      .d('上传目录')}
                    {...formLayout}
                  >
                    {getFieldDecorator('directory')(<Input />)}
                  </FormItem>
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
      </React.Fragment>
    );
  }
}
