"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories, getSubcategoriesByParent } from "@/lib/services";
import { getAllMarkets } from "@/lib/geo";

const phoneCountries = [
  { code: "+1", label: "US / Canada +1" },
  { code: "+7", label: "Russia / Kazakhstan +7" },
  { code: "+20", label: "Egypt +20" },
  { code: "+27", label: "South Africa +27" },
  { code: "+30", label: "Greece +30" },
  { code: "+31", label: "Netherlands +31" },
  { code: "+32", label: "Belgium +32" },
  { code: "+33", label: "France +33" },
  { code: "+34", label: "Spain +34" },
  { code: "+36", label: "Hungary +36" },
  { code: "+39", label: "Italy +39" },
  { code: "+40", label: "Romania +40" },
  { code: "+41", label: "Switzerland +41" },
  { code: "+43", label: "Austria +43" },
  { code: "+44", label: "UK +44" },
  { code: "+45", label: "Denmark +45" },
  { code: "+46", label: "Sweden +46" },
  { code: "+47", label: "Norway +47" },
  { code: "+48", label: "Poland +48" },
  { code: "+49", label: "Germany +49" },
  { code: "+51", label: "Peru +51" },
  { code: "+52", label: "Mexico +52" },
  { code: "+53", label: "Cuba +53" },
  { code: "+54", label: "Argentina +54" },
  { code: "+55", label: "Brazil +55" },
  { code: "+56", label: "Chile +56" },
  { code: "+57", label: "Colombia +57" },
  { code: "+58", label: "Venezuela +58" },
  { code: "+60", label: "Malaysia +60" },
  { code: "+61", label: "Australia +61" },
  { code: "+62", label: "Indonesia +62" },
  { code: "+63", label: "Philippines +63" },
  { code: "+64", label: "New Zealand +64" },
  { code: "+65", label: "Singapore +65" },
  { code: "+66", label: "Thailand +66" },
  { code: "+81", label: "Japan +81" },
  { code: "+82", label: "South Korea +82" },
  { code: "+84", label: "Vietnam +84" },
  { code: "+86", label: "China +86" },
  { code: "+90", label: "Turkey +90" },
  { code: "+91", label: "India +91" },
  { code: "+92", label: "Pakistan +92" },
  { code: "+93", label: "Afghanistan +93" },
  { code: "+94", label: "Sri Lanka +94" },
  { code: "+95", label: "Myanmar +95" },
  { code: "+98", label: "Iran +98" },
  { code: "+211", label: "South Sudan +211" },
  { code: "+212", label: "Morocco +212" },
  { code: "+213", label: "Algeria +213" },
  { code: "+216", label: "Tunisia +216" },
  { code: "+218", label: "Libya +218" },
  { code: "+220", label: "Gambia +220" },
  { code: "+221", label: "Senegal +221" },
  { code: "+222", label: "Mauritania +222" },
  { code: "+223", label: "Mali +223" },
  { code: "+224", label: "Guinea +224" },
  { code: "+225", label: "Ivory Coast +225" },
  { code: "+226", label: "Burkina Faso +226" },
  { code: "+227", label: "Niger +227" },
  { code: "+228", label: "Togo +228" },
  { code: "+229", label: "Benin +229" },
  { code: "+230", label: "Mauritius +230" },
  { code: "+231", label: "Liberia +231" },
  { code: "+232", label: "Sierra Leone +232" },
  { code: "+233", label: "Ghana +233" },
  { code: "+234", label: "Nigeria +234" },
  { code: "+235", label: "Chad +235" },
  { code: "+236", label: "Central African Republic +236" },
  { code: "+237", label: "Cameroon +237" },
  { code: "+238", label: "Cape Verde +238" },
  { code: "+239", label: "Sao Tome and Principe +239" },
  { code: "+240", label: "Equatorial Guinea +240" },
  { code: "+241", label: "Gabon +241" },
  { code: "+242", label: "Republic of the Congo +242" },
  { code: "+243", label: "DR Congo +243" },
  { code: "+244", label: "Angola +244" },
  { code: "+245", label: "Guinea-Bissau +245" },
  { code: "+246", label: "British Indian Ocean Territory +246" },
  { code: "+248", label: "Seychelles +248" },
  { code: "+249", label: "Sudan +249" },
  { code: "+250", label: "Rwanda +250" },
  { code: "+251", label: "Ethiopia +251" },
  { code: "+252", label: "Somalia +252" },
  { code: "+253", label: "Djibouti +253" },
  { code: "+254", label: "Kenya +254" },
  { code: "+255", label: "Tanzania +255" },
  { code: "+256", label: "Uganda +256" },
  { code: "+257", label: "Burundi +257" },
  { code: "+258", label: "Mozambique +258" },
  { code: "+260", label: "Zambia +260" },
  { code: "+261", label: "Madagascar +261" },
  { code: "+263", label: "Zimbabwe +263" },
  { code: "+264", label: "Namibia +264" },
  { code: "+265", label: "Malawi +265" },
  { code: "+266", label: "Lesotho +266" },
  { code: "+267", label: "Botswana +267" },
  { code: "+268", label: "Eswatini +268" },
  { code: "+269", label: "Comoros +269" },
  { code: "+290", label: "Saint Helena +290" },
  { code: "+291", label: "Eritrea +291" },
  { code: "+297", label: "Aruba +297" },
  { code: "+298", label: "Faroe Islands +298" },
  { code: "+299", label: "Greenland +299" },
  { code: "+350", label: "Gibraltar +350" },
  { code: "+351", label: "Portugal +351" },
  { code: "+352", label: "Luxembourg +352" },
  { code: "+353", label: "Ireland +353" },
  { code: "+354", label: "Iceland +354" },
  { code: "+355", label: "Albania +355" },
  { code: "+356", label: "Malta +356" },
  { code: "+357", label: "Cyprus +357" },
  { code: "+358", label: "Finland +358" },
  { code: "+359", label: "Bulgaria +359" },
  { code: "+370", label: "Lithuania +370" },
  { code: "+371", label: "Latvia +371" },
  { code: "+372", label: "Estonia +372" },
  { code: "+373", label: "Moldova +373" },
  { code: "+374", label: "Armenia +374" },
  { code: "+375", label: "Belarus +375" },
  { code: "+376", label: "Andorra +376" },
  { code: "+377", label: "Monaco +377" },
  { code: "+378", label: "San Marino +378" },
  { code: "+380", label: "Ukraine +380" },
  { code: "+381", label: "Serbia +381" },
  { code: "+382", label: "Montenegro +382" },
  { code: "+383", label: "Kosovo +383" },
  { code: "+385", label: "Croatia +385" },
  { code: "+386", label: "Slovenia +386" },
  { code: "+387", label: "Bosnia and Herzegovina +387" },
  { code: "+389", label: "North Macedonia +389" },
  { code: "+420", label: "Czech Republic +420" },
  { code: "+421", label: "Slovakia +421" },
  { code: "+423", label: "Liechtenstein +423" },
  { code: "+500", label: "Falkland Islands +500" },
  { code: "+501", label: "Belize +501" },
  { code: "+502", label: "Guatemala +502" },
  { code: "+503", label: "El Salvador +503" },
  { code: "+504", label: "Honduras +504" },
  { code: "+505", label: "Nicaragua +505" },
  { code: "+506", label: "Costa Rica +506" },
  { code: "+507", label: "Panama +507" },
  { code: "+508", label: "Saint Pierre and Miquelon +508" },
  { code: "+509", label: "Haiti +509" },
  { code: "+590", label: "Guadeloupe / Saint Martin +590" },
  { code: "+591", label: "Bolivia +591" },
  { code: "+592", label: "Guyana +592" },
  { code: "+593", label: "Ecuador +593" },
  { code: "+594", label: "French Guiana +594" },
  { code: "+595", label: "Paraguay +595" },
  { code: "+596", label: "Martinique +596" },
  { code: "+597", label: "Suriname +597" },
  { code: "+598", label: "Uruguay +598" },
  { code: "+599", label: "Caribbean Netherlands +599" },
  { code: "+670", label: "Timor-Leste +670" },
  { code: "+672", label: "Norfolk Island / Antarctica +672" },
  { code: "+673", label: "Brunei +673" },
  { code: "+674", label: "Nauru +674" },
  { code: "+675", label: "Papua New Guinea +675" },
  { code: "+676", label: "Tonga +676" },
  { code: "+677", label: "Solomon Islands +677" },
  { code: "+678", label: "Vanuatu +678" },
  { code: "+679", label: "Fiji +679" },
  { code: "+680", label: "Palau +680" },
  { code: "+681", label: "Wallis and Futuna +681" },
  { code: "+682", label: "Cook Islands +682" },
  { code: "+683", label: "Niue +683" },
  { code: "+685", label: "Samoa +685" },
  { code: "+686", label: "Kiribati +686" },
  { code: "+687", label: "New Caledonia +687" },
  { code: "+688", label: "Tuvalu +688" },
  { code: "+689", label: "French Polynesia +689" },
  { code: "+690", label: "Tokelau +690" },
  { code: "+691", label: "Micronesia +691" },
  { code: "+692", label: "Marshall Islands +692" },
  { code: "+850", label: "North Korea +850" },
  { code: "+852", label: "Hong Kong +852" },
  { code: "+853", label: "Macau +853" },
  { code: "+855", label: "Cambodia +855" },
  { code: "+856", label: "Laos +856" },
  { code: "+880", label: "Bangladesh +880" },
  { code: "+886", label: "Taiwan +886" },
  { code: "+960", label: "Maldives +960" },
  { code: "+961", label: "Lebanon +961" },
  { code: "+962", label: "Jordan +962" },
  { code: "+963", label: "Syria +963" },
  { code: "+964", label: "Iraq +964" },
  { code: "+965", label: "Kuwait +965" },
  { code: "+966", label: "Saudi Arabia +966" },
  { code: "+967", label: "Yemen +967" },
  { code: "+968", label: "Oman +968" },
  { code: "+970", label: "Palestine +970" },
  { code: "+971", label: "UAE +971" },
  { code: "+972", label: "Israel +972" },
  { code: "+973", label: "Bahrain +973" },
  { code: "+974", label: "Qatar +974" },
  { code: "+975", label: "Bhutan +975" },
  { code: "+976", label: "Mongolia +976" },
  { code: "+977", label: "Nepal +977" },
  { code: "+992", label: "Tajikistan +992" },
  { code: "+993", label: "Turkmenistan +993" },
  { code: "+994", label: "Azerbaijan +994" },
  { code: "+995", label: "Georgia +995" },
  { code: "+996", label: "Kyrgyzstan +996" },
  { code: "+998", label: "Uzbekistan +998" },
];

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length >= 7 && digits.length <= 14;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function BookRequestForm() {
  const searchParams = useSearchParams();
  const markets = getAllMarkets();

  const initialCategory = searchParams.get("category") ?? "";
  const initialSubcategory = searchParams.get("subcategory") ?? "";
  const initialMarket = searchParams.get("market") ?? "";

  const initialMarketData = markets.find(
    (market) => market.slug === initialMarket
  );

  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [subcategorySlug, setSubcategorySlug] = useState(initialSubcategory);
  const [citySearch, setCitySearch] = useState(
    initialMarketData
      ? `${initialMarketData.city}, ${initialMarketData.state}`
      : ""
  );
  const [marketSlug, setMarketSlug] = useState(initialMarket);
  const [streetAddress, setStreetAddress] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [notifyByEmail] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const subcategoryOptions = useMemo(() => {
    if (!categorySlug) return [];
    return getSubcategoriesByParent(categorySlug);
  }, [categorySlug]);

  const cityOptions = useMemo(() => {
    const query = citySearch.trim().toLowerCase();

    if (query.length < 1) return markets.slice(0, 8);

    return markets
      .filter((market) => {
        return (
          market.city.toLowerCase().includes(query) ||
          market.state.toLowerCase().includes(query) ||
          market.region.toLowerCase().includes(query) ||
          market.zip.some((zip) => zip.includes(query))
        );
      })
      .slice(0, 8);
  }, [citySearch, markets]);

  function resetStatus() {
    setStatus("idle");
    setErrorMessage("");
  }

  function selectMarket(slug: string, label: string) {
    setMarketSlug(slug);
    setCitySearch(label);
    resetStatus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPhone = normalizePhone(phoneNumber);

    if (!categorySlug) {
      setStatus("error");
      setErrorMessage("Please select a main service category.");
      return;
    }

    if (!marketSlug) {
      setStatus("error");
      setErrorMessage("Please choose a city from the suggested locations.");
      return;
    }

    if (streetAddress.trim().length < 5) {
      setStatus("error");
      setErrorMessage("Please enter the street address for the job.");
      return;
    }

    if (customerName.trim().length < 2) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setStatus("error");
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (description.trim().length < 20) {
      setStatus("error");
      setErrorMessage("Please describe the job with at least 20 characters.");
      return;
    }

    const requestDraft = {
      categorySlug,
      subcategorySlug: subcategorySlug || null,
      marketSlug,
      streetAddress: streetAddress.trim(),
      publicDescription: description.trim(),
      createAccountRequested: createAccount,
      notifyEmail: notifyByEmail,
      privateContact: {
        name: customerName.trim(),
        phoneCountryCode,
        phoneNumber: cleanPhone,
        fullPhone: `${phoneCountryCode}${cleanPhone}`,
        email: email.trim().toLowerCase(),
      },
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDraft),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(result.error ?? "Unable to submit request.");
        return;
      }

      setStatus("success");
      setErrorMessage("");

      if (createAccount) {
        window.location.href = `/customer/signup?intent=customer&request=${result.requestId}&next=/customer`;
        return;
      }

      window.location.href =
        result.requestUrl ?? `/requests/${result.publicSlug}`;
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit request. Please try again.");
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="category">
          Main service category
        </label>

        <select
          id="category"
          name="category"
          className="form-select"
          value={categorySlug}
          required
          onChange={(event) => {
            setCategorySlug(event.target.value);
            setSubcategorySlug("");
            resetStatus();
          }}
        >
          <option value="">Select category</option>

          {Object.values(categories).map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="subcategory">
          Specific service
        </label>

        <select
          id="subcategory"
          name="subcategory"
          className="form-select"
          value={subcategorySlug}
          onChange={(event) => {
            setSubcategorySlug(event.target.value);
            resetStatus();
          }}
          disabled={!categorySlug || subcategoryOptions.length === 0}
        >
          <option value="">
            {categorySlug ? "Select specific service" : "Select category first"}
          </option>

          {subcategoryOptions.map((subcategory) => (
            <option key={subcategory.slug} value={subcategory.slug}>
              {subcategory.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group booking-location-field">
        <label className="form-label" htmlFor="city">
          Location
        </label>

        <input
          id="city"
          name="city"
          className="form-input"
          value={citySearch}
          required
          onChange={(event) => {
            setCitySearch(event.target.value);
            setMarketSlug("");
            resetStatus();
          }}
          placeholder="Start typing your city"
          autoComplete="off"
        />

        {citySearch && !marketSlug && cityOptions.length > 0 && (
          <div className="booking-city-suggestions">
            {cityOptions.map((market) => {
              const label = `${market.city}, ${market.state}`;

              return (
                <button
                  key={market.slug}
                  type="button"
                  className="booking-city-option"
                  onClick={() => selectMarket(market.slug, label)}
                >
                  <span>{label}</span>
                  <small>{market.region}</small>
                </button>
              );
            })}
          </div>
        )}

        <input type="hidden" name="market" value={marketSlug} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="streetAddress">
          Street address
        </label>

        <input
          id="streetAddress"
          name="streetAddress"
          className="form-input"
          value={streetAddress}
          required
          onChange={(event) => {
            setStreetAddress(event.target.value);
            resetStatus();
          }}
          placeholder="Street address, apartment, unit"
          autoComplete="street-address"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="customerName">
          Your name
        </label>

        <input
          id="customerName"
          name="customerName"
          className="form-input"
          value={customerName}
          required
          onChange={(event) => {
            setCustomerName(event.target.value);
            resetStatus();
          }}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phoneNumber">
          Phone number
        </label>

        <div className="grid-2">
          <select
            id="phoneCountryCode"
            name="phoneCountryCode"
            className="form-select"
            value={phoneCountryCode}
            required
            onChange={(event) => {
              setPhoneCountryCode(event.target.value);
              resetStatus();
            }}
          >
            {phoneCountries.map((country) => (
              <option key={`${country.code}-${country.label}`} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>

          <input
            id="phoneNumber"
            name="phoneNumber"
            className="form-input"
            value={phoneNumber}
            required
            onChange={(event) => {
              setPhoneNumber(normalizePhone(event.target.value));
              resetStatus();
            }}
            placeholder="Phone number"
            inputMode="numeric"
            autoComplete="tel-national"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email
        </label>

        <input
          id="email"
          name="email"
          className="form-input"
          type="email"
          value={email}
          required
          onChange={(event) => {
            setEmail(event.target.value);
            resetStatus();
          }}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Describe the job
        </label>

        <textarea
          id="description"
          name="description"
          className="form-textarea"
          rows={6}
          value={description}
          required
          minLength={20}
          onChange={(event) => {
            setDescription(event.target.value);
            resetStatus();
          }}
          placeholder="Example: I need help mounting a TV on drywall and hiding the wires."
        />
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={createAccount}
            onChange={(event) => {
              setCreateAccount(event.target.checked);
              resetStatus();
            }}
          />

          <span>
            Create account to manage this request
            <small>
              You’ll be able to edit, archive, or delete your request. Requests
              are automatically archived after 10 days or when the response
              limit is reached.
            </small>
          </span>
        </label>
      </div>

      <p className="text-muted">
        Your address and contact details will not be shown publicly. They will
        only be available to pros after paid access.
      </p>

      {status === "error" && (
        <div className="form-message form-message-error">{errorMessage}</div>
      )}

      {status === "success" && (
        <div className="form-message form-message-success">
          Request created successfully.
        </div>
      )}

      <div className="flex gap-md">
        <button type="submit" className="button button-primary">
          Submit request
        </button>

        <Link href="/services" className="button button-secondary">
          Browse services
        </Link>
      </div>
    </form>
  );
}