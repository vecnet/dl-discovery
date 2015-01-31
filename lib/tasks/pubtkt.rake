require 'rake'
require 'pub_ticket'
require 'openssl'
require 'time'

namespace :pubtkt do
  desc "Create a Public Key Pair (DSA) and save to files `pubtkt-private.pem` and `pubtkt.pem`"
  task :generate_keys do
    # generate a new DSA key-pair
    # from http://www.ruby-doc.org/stdlib-2.0/libdoc/openssl/rdoc/OpenSSL.html
    key = OpenSSL::PKey::DSA.new 1024
    open('pubtkt-private.pem', 'w') { |f| f.write(key.to_pem) }
    open('pubtkt.pem', 'w') { |f| f.write(key.public_key.to_pem) }
  end

  desc %q{Generate a pubtkt and print to stdout. Uses the envrionment variables:
  P_KEY = name of file with private key
  P_UID = the uid of the user
  P_CLIENT_IP = the ip address of the user
  P_VALIDUNTIL = the experiation time (seconds since epoch)
  P_TOKENS = comma seperated string of tokens}
  task :create do
    private_key = OpenSSL::PKey.read(IO.read(ENV['P_KEY']))
    ticket = PubTicket.new('')
    ticket.uid = ENV['P_UID']
    ticket.clientip = ENV['P_CLIENT_IP']
    ticket.valid_until = ENV['P_VALIDUNTIL']
    ticket.tokens = ENV['P_TOKENS']
    ticket.generate_signature(private_key)
    puts ticket.ticket
  end

  desc %q{Verify a pubtkt. Prints result to stdout. Uses the envrionment variables:
  P_KEY = name of file with public key
  P_TICKET = the complete pub ticket}
  task :verify do
    public_key = OpenSSL::PKey.read(IO.read(ENV['P_KEY']))
    ticket = PubTicket.new(ENV['P_TICKET'])
    puts "Ticket text: #{ticket.text}"
    puts "Ticket sig : #{ticket.signature}"
    puts "Sig Valid? : #{ticket.signature_valid?(public_key)}"
    puts "Expired?   : #{Time.now > ticket.valid_until}"
  end
end
