import { getTestString } from '../../../server/actions/test'

export default async function TestPage () {
    const str = await getTestString()
    return <>{str}</>
}