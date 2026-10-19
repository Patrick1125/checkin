const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) return
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.cloud/console/checkin',
      'user-agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    }
    const checkin = await fetch('https://glados.cloud/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token":"glados.cloud"}',
    }).then((r) => r.json())
    const status = await fetch('https://glados.cloud/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    return [
      'Checkin OK',
      `${checkin.message}`,
      `Left Days ${Number(status.data.leftDays)}`,
    ]
  } catch (error) {
    return [
      'Checkin Error',
      `${error}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const notify = async (contents) => {
  const token = process.env.NOTIFY
  if (!token || !contents) return
  await fetch(`https://www.pushplus.plus/send`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      token,
      title: contents[0],
      content: contents.join('<br>'),
      template: 'markdown',
    }),
  })
}

const main = async () => {
  const result = await glados()

  if (!result) {
    console.error('GLADOS Cookie 未配置')
    process.exitCode = 1
    return
  }

  console.log('===== GLaDOS 签到结果 =====')
  console.log(result.join('\n'))
  console.log('==========================')

  if (result[0] === 'Checkin Error') {
    process.exitCode = 1
  }

  await notify(result)
}

main().catch(error => {
  console.error('程序执行失败:', error.message)
  process.exitCode = 1
})
