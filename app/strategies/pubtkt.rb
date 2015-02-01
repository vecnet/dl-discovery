require 'time'
require 'pub_ticket'
Warden::Strategies.add(:pubtkt) do
  def valid?
    request.cookies['auth_pubtkt']
  end

  # we don't do the automatic redirects that
  # the reference pubtkt apache module does
  def authenticate!
    u = nil
    ticket = request.cookies['auth_pubtkt']
    # cache pubticket? to reduce parsing and crypto checking
    #logger.debug "Found Pub Ticket: #{ticket}"
    pt = ::PubTicket.new(ticket)  # Rails has already URL unescaped `ticket`
    if pt.signature_valid?(Rails.configuration.pubtkt_public_key)
      if pt.ticket_valid?(request.ip, Time.now)
        #logger.info "Pubtkt: Signature and ticket valid. User: #{pt.uid}, Groups: #{pt.tokens}"
        u = User.find_or_create_from_pubtkt(pt)
      end
    end
    u.nil? ? fail!("Invalid Pubtkt") : success!(u)
  end

  # do not store the user in the session
  def store?
    false
  end
end
