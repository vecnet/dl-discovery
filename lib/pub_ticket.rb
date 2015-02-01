require 'openssl'
require 'base64'
require 'time'

class PubTicket
  attr_accessor \
    :ticket,    # the entire ticket cookie
    :text,      # the part of the ticket which is not a signature
    :signature  # the signature

  def initialize(ticket='')
    self.ticket = ticket
    if ticket.rindex(';sig=')
      self.text, _, self.signature = ticket.rpartition(';sig=')
    end
  end

  def to_s
    "<Pubticket #{self.text}>"
  end

  def fields
    @fields ||= decode(self.text ? self.text : '')
  end

  # fields in the ticket
  def self.data_field(access_name, hash_name, transform="")
    self.class_eval %Q{
      def #{access_name}
        v = fields.fetch("#{hash_name}", nil)
        #{transform}(v)
      end
      def #{access_name}=(v)
        fields["#{hash_name}"] = v
      end
    }
  end

  data_field :uid,         "uid"
  data_field :clientip,    "cip"
  data_field :valid_until, "validuntil", "lambda {|v| Time.at(v.to_i)}.call"
  data_field :grace_period,"graceperiod", "lambda {|v| Time.at(v.to_i)}.call"
  data_field :bauth,       "bauth"
  data_field :tokens,      "tokens"
  data_field :user_data,   "udata"

  def signature_valid?(public_key)
    @sig_valid ||= if self.signature
                     signature = Base64.decode64(self.signature)
                     digest = digest_class(public_key).new
                     public_key.verify(digest, signature, self.text)
                   else
                     false
                   end
  rescue OpenSSL::PKey::PKeyError
    @sig_valid = false
  end

  def ticket_valid?(request_ip, current_time)
    if clientip && clientip != request_ip
      return false
    elsif current_time > valid_until
      return false
    end
    true
  end

  def generate_signature(private_key)
    payload = {}
    payload["uid"] = self.uid[0..31] if self.uid
    payload["cip"] = self.clientip if self.clientip
    payload["validuntil"] = self.valid_until.to_i if self.valid_until > Time.at(0)
    payload["graceperiod"] = self.grace_period.to_i if self.grace_period > Time.at(0)
    payload["tokens"] = self.tokens[0..254] if self.tokens
    payload["udata"] = self.user_data[0..254] if self.user_data
    payload["bauth"] = self.bauth if self.bauth
    self.text = encode(payload)

    digest = digest_class(private_key).new
    signature = private_key.sign(digest, self.text)
    self.signature = Base64.strict_encode64(signature)
    self.ticket = "#{self.text};sig=#{self.signature}"
  end

  private
  def get_parameter(data, field_name, xform=nil)
    v = data.fetch(field_name, nil)
    if xform.respond_to?(:call) && !v.nil? then xform.call(v) else v end
  end

  def digest_class(key)
    if key.is_a?(OpenSSL::PKey::RSA)
      OpenSSL::Digest::SHA1
    else
      OpenSSL::Digest::DSS1
    end
  end

  def encode(input)
    if input.is_a?(Hash)
      input.collect { |k,v| "#{k}=#{v}" }.join(";")
    else
      "#{input}"
    end
  end

  # the input is a string of fields in the form key=value
  # seperated by semicolons.
  # The characters '=' and ';' cannot be escaped. sorry.
  def decode(str)
    Hash[str.split(';').map { |value| value.split('=',2) }]
  end
end

