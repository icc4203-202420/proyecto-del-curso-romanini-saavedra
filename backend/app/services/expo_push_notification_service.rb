require 'net/http'
require 'uri'
require 'json'

class ExpoPushNotificationService
  EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'.freeze

  def self.send_notification(token, message, data = {})
    return unless token

    uri = URI.parse(EXPO_PUSH_URL)
    headers = { 'Content-Type' => 'application/json' }
    body = {
      to: token,
      sound: 'default',
      title: 'New Event Attendance!',
      body: message,
      data: data
    }.to_json

    Net::HTTP.post(uri, body, headers)
  end
end