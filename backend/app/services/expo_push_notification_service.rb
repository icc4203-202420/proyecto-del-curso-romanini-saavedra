require 'net/http'
require 'uri'
require 'json'

class ExpoPushNotificationService
  EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'.freeze

  def self.send_notification(token, message, data = {}, title)
    return unless token

    uri = URI.parse(EXPO_PUSH_URL)
    headers = { 'Content-Type' => 'application/json' }
    body = {
      to: token,
      sound: 'default',
      title: title,
      body: message,
      data: data
    }.to_json

    response = Net::HTTP.post(uri, body, headers)

    if response.is_a?(Net::HTTPSuccess)
      puts "Notification sent to a #{token}: #{response.body}"
    else
      puts "Error sending notification to #{token}: #{response.code} - #{response.body}"
    end
  end
end