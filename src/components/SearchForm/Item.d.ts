import React from 'react';

interface SearchFormItemProp {
  /**
   * label
   */
  label: string;
  /**
   * 编码 用作 Item 的 key
   */
  name: string;
  /**
   * 跨行
   */
  colSpan: number;
  /**
   * label后是否显示 :
   */
  colon: boolean;
  /**
   * 设置label的宽度
   */
  labelWidth: number;
  /**
   * 设置 输入组件的宽度
   */
  inputWidth: number;
  /**
   * 输入组件
   */
  children: React.ReactElement;
}

export default class SearchFormItem extends React.Component<SearchFormItemProp> {}
