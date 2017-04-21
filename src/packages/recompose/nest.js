import createEagerFactory from './createEagerFactory'
import getDisplayName from './getDisplayName'

const nest = (...Components) => {
  const factories = Components.map(createEagerFactory)
  const Nest = ({ ...props, children }) =>
    factories.reduceRight((child, factory) => factory(props, child), children)

  if (process.env.NODE_ENV !== 'production') {
    const displayNames = Components.map(getDisplayName)
    Nest.displayName = `nest(${displayNames.join(', ')})`
  }

  return Nest
}

export default nest
