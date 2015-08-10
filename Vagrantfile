Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.define "brainch"
  config.vm.synced_folder ".", "/home/vagrant/brainch/", id: "vagrant-root",
    owner: "vagrant",
    group: "www-data",
    mount_options: ["dmode=775,fmode=664"],
    create: true
  config.vm.provision :shell, path: "scripts/vagrant.sh"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = 512
    vb.cpus = 2
  end
end
