require 'spec_helper'
require 'openssl'
require 'base64'
require_relative '../../lib/pub_ticket'

describe PubTicket do
  let(:dsa_private_key) { OpenSSL::PKey.read %Q{-----BEGIN DSA PRIVATE KEY-----
MIIBuwIBAAKBgQD8SBex5jpx45TqNwuAklFjgNUxa60fGsjYWIE/eTnLDF5WmkBx
el4Iz0xaEI6EOBplHEPagbpqvvFnFcnUK3+4t+jq57D/4NVwXFJHU++qgQMu7K84
N0m9HNiRhM3XEr1v5RlfmUCUM6vDROfhEWWwgxfKDrSQi//yZ27PGkbVMwIVAMx5
+7JPX5tzhoXXNC4IjKTbnL1rAoGAGJQSCtMFKFi90k2FAOg7vhp7Fwu0IwmnXRIM
t+jcNTncxkUtklhWUR20ZJ6t1hq63UPquwZ4XYD45MHNoXyXR0lVEZe74lK9Xzmm
OImBuYJdBiN75RbjoWjyy2KVmklCylDGvkXsF/o5LDi2aMxtcOYkf41JZDFVG/n+
xL5Z6ScCgYEA9T1el54DlVN7F4OBGwIxGwnpsjt5mcgFeFbYM53tjTkgljkrLWmm
WwTt9A650taMweCOp+T/L2c6gnZa7abKCWZjfBBNwoK/v4IKMwDvmRcw275lvWTl
FL3HVK9QVHv8fYXg1oQ/05DI2aDuCmDUp5Jk6ePl7B5glZiSoJZYUkMCFGDlMEur
j7ndb1DQy5mHeqWskXwL
-----END DSA PRIVATE KEY-----
}
  }
  let(:dsa_public_key) { OpenSSL::PKey.read %Q{-----BEGIN PUBLIC KEY-----
MIIBtzCCASsGByqGSM44BAEwggEeAoGBAPxIF7HmOnHjlOo3C4CSUWOA1TFrrR8a
yNhYgT95OcsMXlaaQHF6XgjPTFoQjoQ4GmUcQ9qBumq+8WcVydQrf7i36OrnsP/g
1XBcUkdT76qBAy7srzg3Sb0c2JGEzdcSvW/lGV+ZQJQzq8NE5+ERZbCDF8oOtJCL
//Jnbs8aRtUzAhUAzHn7sk9fm3OGhdc0LgiMpNucvWsCgYAYlBIK0wUoWL3STYUA
6Du+GnsXC7QjCaddEgy36Nw1OdzGRS2SWFZRHbRknq3WGrrdQ+q7BnhdgPjkwc2h
fJdHSVURl7viUr1fOaY4iYG5gl0GI3vlFuOhaPLLYpWaSULKUMa+RewX+jksOLZo
zG1w5iR/jUlkMVUb+f7EvlnpJwOBhQACgYEA9T1el54DlVN7F4OBGwIxGwnpsjt5
mcgFeFbYM53tjTkgljkrLWmmWwTt9A650taMweCOp+T/L2c6gnZa7abKCWZjfBBN
woK/v4IKMwDvmRcw275lvWTlFL3HVK9QVHv8fYXg1oQ/05DI2aDuCmDUp5Jk6ePl
7B5glZiSoJZYUkM=
-----END PUBLIC KEY-----
}
  }
  let(:ticket_dsa) { "uid=foobar;validuntil=123456789;tokens=;udata=;sig=MCwCFEmMvKWbbIjTCJMbgz1P4N+TWOodAhRRTr9odvBjKtCKaE1B6ysW548oqw==" }

  describe ".initialize" do
    let(:fields) { "uid=xxx;validuntil=123456789;tokens=;udata=;sig=xxx" }
    let(:sig) { "1234567890" }
    let(:ticket) { "#{fields};sig=#{sig}" }

    it 'should parse the signature, if present' do
      pt = PubTicket.new(ticket)
      expect(pt.ticket).to eq(ticket)
      expect(pt.text).to eq(fields)
      expect(pt.signature).to eq(sig)
      expect(pt.signature_valid?(dsa_public_key)).to be_falsey
    end
    it 'validates a good signature' do
      pt = PubTicket.new(ticket_dsa)
      expect(pt.signature_valid?(dsa_public_key)).to be_truthy
    end
    it 'parses the fields correctly' do
      pt = PubTicket.new(ticket)
      expect(pt.uid).to eq("xxx")
      expect(pt.valid_until).to eq(Time.at(123456789))
      expect(pt.tokens).to eq("")
      expect(pt.user_data).to eq("")
    end
  end
end
