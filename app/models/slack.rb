class Slack
  def self.client_id
    config[:client_id]
  end

  def self.secret
    config[:secret]
  end

  def self.config
    @config ||= (YAML.load(File.read("slack.conf")).with_indifferent_access || {})
  end
end
