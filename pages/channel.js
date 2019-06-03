import Link from 'next/link'
import Error from './_error'
import Layout from './components/Layout'
import ChannelGrid from './components/ChannelGrid'
import PodcastList from './components/PodcastList'

export default class extends React.Component {

  static async getInitialProps({ query, res }) {
    console.log(query)
    let idChannel = query.id

    try {let [reqChannel, reqSeries, reqAudios ] = await Promise.all([
      fetch(`https://api.audioboom.com/channels/${idChannel}`),
      fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`),
      fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`),
    ])

    if( reqChannel.status >= 400 ) {
      res.statusCode = reqChannel.status
      return { channel: null, audioClips: null, series: null, statusCode: reqChannel.status}
    }

    let [dataChannel, dataSeries, dataAudios] = await Promise.all([
      reqChannel.json(),
      reqSeries.json(),
      reqAudios.json()
    ])
    
    let channel = dataChannel.body.channel
    let series = dataSeries.body.channels
    let audioClips = dataAudios.body.audio_clips

    return { channel, audioClips, series, statusCode: 200 }
    } catch(e) {
      return { channel: null, audioClips: null, series: null, statusCode: 503}
    }
  }

  render() {
    const { channel, audioClips, series, statusCode } = this.props

    if( statusCode !== 200 ) {
      return <Error statusCode={ statusCode } />
    } 

    return <Layout title={ channel.title }>
      <div className='title'>
      </div>
        <h1> { channel.title } </h1>
    <div className='flex'>
    { series.length > 0 &&
        <div className='series'>
          <h2> Series </h2>
          <ChannelGrid channels= {series} />
        </div>
      }
      <div>
        <h2>Ultimos Podcasts</h2>
        <PodcastList audioClips= { audioClips }/>
      </div>
    </div>
      

<style jsx>{`
        header {
          color: #fff;
          background: #8756ca;
          padding: 15px;
          text-align: center;
        }

        .banner {
          width: 100%;
          padding-bottom: 25%;
          background-position: 50% 50%;
          background-size: cover;
          background-color: #aaa;
        }

        .channels {
          display: grid;
          grid-gap: 15px;
          padding: 15px;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }
        a.channel {
          display: block;
          margin-bottom: 0.5em;
          color: #333;
          text-decoration: none;
        }
        .channel img {
          border-radius: 3px;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
          width: 100%;
        }
        .flex {
          display: flex;
          justify-content: space-around;
        }
        .series {
          width: 65%;
        }
        .title {
          margin-top: 0;
          padding-top: 40px;
          padding-bottom: auto; 
          color: white;
          text-align: center;
          justify-content: center;
          background-image: url("${channel.urls.banner_image.original || channel.urls.logo_image.original}");
          background-size: cover;
          width: 100%;
          height: 150px;
        }
        h1 {
          font-weight: 600;
          padding: 15px;
        }
        h2 {
          padding: 5px;
          font-size: 0.9em;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }
      `}</style>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: system-ui;
          background: white;
        }
      `}</style>
    </Layout>
    }
}