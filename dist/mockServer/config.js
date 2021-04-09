/**
 *
 * Assume a configuration specified as:
 * {
 *   admin: $RouterConfig，参照下方
 *   idp: $RouterConfig，参照下方
 *   portal: $RouterConfig，参照下方
 * }
 *
 * RouterConfig:
 * [
 *   {
 *     context: ...,
 *     exact?: boolean, // 精确匹配路由
 *     transformList?: boolean, // 返回数据是否转换为格式: { data: [], total: 0 }
 *   }
 * ]
 *
 * EXAMPLE:
 *  {
      admin: [
        { context: '/zones', exact: true, transformList: true },
        { context: '/zones/countrycode' },
        { context: '/zones/*' },
      ],
      portal: [{ context: '/apps', exact: true, transformList: true }],
    };
 * */

module.exports = {
  admin: [
    { context: '/zones', exact: true, transformList: true },
    { context: '/zones/countrycode', transformList: true },
    { context: '/zones/*' },
  ],
  portal: [
    // { context: '/appentrusts', exact: true, transformList: true },
    // { context: '/appentrusts/*' },
  ],
};
