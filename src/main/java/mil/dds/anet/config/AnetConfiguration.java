package mil.dds.anet.config;

import java.util.Map;
import java.util.Collections;
import java.util.HashMap;

import com.google.common.collect.ImmutableMap;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;

public class AnetConfiguration extends Configuration {

	private boolean developmentMode;
	private String securityMarking;
	private String securityColor;
	
	private SmtpConfiguration smtp;
	
	@NotNull
	private Map<String,String> waffleConfig = new HashMap<String,String>();
	
	@Valid
    @NotNull
    private DataSourceFactory database = new DataSourceFactory();

	@NotNull
	private Map<String, Map<String, String>> views = Collections.emptyMap();

    @JsonProperty("database")
    public void setDataSourceFactory(DataSourceFactory factory) {
        this.database = factory;
    }

    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return database;
    }

	public boolean isDevelopmentMode() {
		return developmentMode;
	}

	public void setDevelopmentMode(boolean developmentMode) {
		this.developmentMode = developmentMode;
	}

	public String getSecurityMarking() {
		return securityMarking;
	}

	public void setSecurityMarking(String securityMarking) {
		this.securityMarking = securityMarking;
	}

	public String getSecurityColor() {
		return securityColor;
	}

	public void setSecurityColor(String securityColor) {
		this.securityColor = securityColor;
	}

	@JsonProperty("views")
	public Map<String, Map<String, String>> getViews() {
		return views;
	}

	@JsonProperty("views")
	public void setViews(Map<String, Map<String, String>> views) {
		final ImmutableMap.Builder<String, Map<String, String>> builder = ImmutableMap.builder();
		for (Map.Entry<String, Map<String, String>> entry : views.entrySet()) {
			builder.put(entry.getKey(), ImmutableMap.copyOf(entry.getValue()));
		}
		this.views = builder.build();
	}
	
	public Map<String, String> getWaffleConfig() {
		return waffleConfig;
	}
	
	public void setWaffleConfig(Map<String,String> config) { 
		this.waffleConfig = config;
	}
	
	public SmtpConfiguration getSmtp() {
		return smtp;
	}

	public void setSmtp(SmtpConfiguration smtp) {
		this.smtp = smtp;
	}

	public static class SmtpConfiguration { 
		private String hostname;
		private Integer port = 587;
		private String username;
		private String password;
		private Boolean startTLS = true;
		public String getHostname() {
			return hostname;
		}
		public void setHostname(String hostname) {
			this.hostname = hostname;
		}
		public Integer getPort() {
			return port;
		}
		public void setPort(Integer port) {
			this.port = port;
		}
		public String getUsername() {
			return username;
		}
		public void setUsername(String username) {
			this.username = username;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
		public Boolean getStartTLS() {
			return startTLS;
		}
		public void setStartTLS(Boolean startTLS) {
			this.startTLS = startTLS;
		}
	}

	
}
