const { name, version, repository } = require('./package.json')
const { styles, theme } = require('./styleguide.styles')
const path = require('path')

const sections = [
  {
    name: 'Checker-obs-translationNotes',
    content: 'src/components/CheckerObsTn.md',
  },
  {
    name: 'Checker-translationWords',
    content: 'src/components/CheckerTW.md',
  },
  {
    name: 'Checker-translationNotes',
    content: 'src/components/CheckerTN.md',
  },
  {
    name: 'CheckArea',
    content: 'src/components/CheckArea.md',
  },
]

module.exports = {
  title: `${name} v${version}`,
  ribbon: {
    url: repository,
    text: 'View on GitHub',
  },
  styles,
  theme,
  sections,
  components: 'src/components/*.js',
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '/public/icons/[name].[ext]',
              },
            },
          ],
        },
      ],
    },
  },
}
