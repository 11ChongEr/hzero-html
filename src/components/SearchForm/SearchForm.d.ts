import * as React from 'react';
import SearchFormItem from './Item';

interface SearchFormProp {
  align: 'left' | 'right' | 'center';
  /**
   * 是否 收起 展开
   */
  showAdvance: boolean;
  /**
   * items
   */
  children: SearchFormItem | SearchFormItem[];
  /**
   * 设置整体的 label 宽度, 会被 SearchFormItem 覆盖
   */
  labelWidth: number;
  /**
   * 输入组件的 整体宽度 会被 SearchFormItem 覆盖
   */
  inputWidth: number;
  /**
   * 每行展示的 字段数量
   */
  column: number;
  className: string;
}

export default class SearchForm extends React.Component<SearchFormProp> {}
