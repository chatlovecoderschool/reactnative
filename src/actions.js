import SendBird from 'sendbird'
import {APP_ID} from './consts'

const sendbird = new SendBird({
  appId: APP_ID
})

export default function mapDispatchToProps (dispatch) {
  return {
    connect: (userId) => {
      const payload = new Promise((resolve, reject) => {
        sendbird.connect(userId, (u, err) => {
          resolve(u)
        })
      })
      return dispatch({
        type: 'CONNECTION',
        payload
      })
    }
  }
}
